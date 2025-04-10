import uvicorn
from uvicorn.config import Config
from uvicorn.server import Server
import json
from typing import Dict, Any
from SPVSimAPI import SPVSim

class SPVSimServer:
    def __init__(self, host: str = "0.0.0.0", port: int = 8001):
        self.host = host
        self.port = port
        self.sim = None  # Initialize simulation object

    async def run_simulation(self, scope, receive, send):
        assert scope['type'] == 'http'
        
        # Receive the request body
        body = b''
        more_body = True
        while more_body:
            message = await receive()
            if message['type'] == 'http.request':
                body += message.get('body', b'')
                more_body = message.get('more_body', False)
        
        try:
            # Parse request body
            request_data = json.loads(body.decode('utf-8'))
            
            # Create a new simulation instance
            sim = SPVSim()
            
            # Configure the simulation from the request data
            sim.configure_from_request(request_data)
            
            # Execute simulation
            results = sim.execute_simulation()
            
            # Prepare response
            response_body = json.dumps(results).encode('utf-8')
            
            await send({
                'type': 'http.response.start',
                'status': 200,
                'headers': [
                    [b'content-type', b'application/json']
                ]
            })
            await send({
                'type': 'http.response.body',
                'body': response_body
            })
        
        except Exception as e:
            error_response = json.dumps({
                "detail": f"Simulation error: {str(e)}"
            }).encode('utf-8')
            
            await send({
                'type': 'http.response.start',
                'status': 500,
                'headers': [
                    [b'content-type', b'application/json']
                ]
            })
            await send({
                'type': 'http.response.body',
                'body': error_response
            })

    async def root(self, scope, receive, send):
        assert scope['type'] == 'http'
        
        response_body = json.dumps({
            "message": "PV Simulation API is running. POST to /simulate to run a simulation."
        }).encode('utf-8')
        
        await send({
            'type': 'http.response.start',
            'status': 200,
            'headers': [
                [b'content-type', b'application/json']
            ]
        })
        await send({
            'type': 'http.response.body',
            'body': response_body
        })

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'http':
            path = scope.get('path', '')
            method = scope.get('method', '')
            
            if path == '/simulate' and method == 'POST':
                await self.run_simulation(scope, receive, send)
            elif path == '/' and method == 'GET':
                await self.root(scope, receive, send)
            else:
                await send({
                    'type': 'http.response.start',
                    'status': 404,
                    'headers': [
                        [b'content-type', b'application/json']
                    ]
                })
                await send({
                    'type': 'http.response.body',
                    'body': json.dumps({"detail": "Not Found"}).encode('utf-8')
                })

def main():
    app = SPVSimServer()
    
    config = Config(
        app=app, 
        host="0.0.0.0", 
        port=8000, 
        workers=1,
        log_level="info"
    )
    
    server = Server(config)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001, 
        log_level="info"
    )

if __name__ == "__main__":
    main()