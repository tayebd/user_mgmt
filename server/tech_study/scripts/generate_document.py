import yaml
import os
import jinja2
from pathlib import Path

def load_data():
    """Load project specifications, component data, and calculation results"""
    with open('data/project_specs.yaml', 'r') as f:
        project_specs = yaml.safe_load(f)
    
    with open('data/components.yaml', 'r') as f:
        components = yaml.safe_load(f)
    
    with open('data/calculation_results/calculations.yaml', 'r') as f:
        calculations = yaml.safe_load(f)
    
    with open('data/constants.yaml', 'r') as f:
        constants = yaml.safe_load(f)
    return project_specs, components, calculations, constants

def render_template(template_path, context):
    """Render a Jinja2 template with the given context"""
    template_dir = os.path.dirname(template_path)
    template_file = os.path.basename(template_path)
    
    # Set up Jinja2 environment
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(template_dir))
    
    # Load the template
    template = env.get_template(template_file)
    
    # Render the template with the context
    return template.render(**context)

def main():
    """Generate the final document by combining templates"""
    # Load data
    project_specs, components, calculations, constants = load_data()
    
    # Combine all data into a single context dictionary
    context = {
        'project_specs': project_specs,
        'components': components,
        'constants': constants.get('constants', {}),
        'project': project_specs.get('project', {}),
        'panel': components.get('panel', {}),
        'inverter': components.get('inverter', {}),
        'dc_protection': components.get('dc_protection', {}),
        'ac_protection': components.get('ac_protection', {}),
        'dc_cable': components.get('dc_cable', {}),
        'ac_cable': components.get('ac_cable', {}),
        'ground_cable': components.get('ground_cable', {}),
        'circuit_breaker': components.get('circuit_breaker', {}),
        'connector': components.get('connector', {}),
        'array': calculations.get('array', {} ),
        'protection': calculations.get('protection', {} ),
        'dc_cable_sizing': calculations.get('dc_cable_sizing', {} ),
        'ac1_cable_sizing': calculations.get('ac1_cable_sizing', {} ),
        'ac2_cable_sizing': calculations.get('ac2_cable_sizing', {} ),
    }
    
    # Ensure output directory exists
    os.makedirs('output', exist_ok=True)
    
    # Render each template
    equipment_content = render_template('templates/fr/equipment.md', context)
    array_config_content = render_template('templates/fr/array_configuration.md', context)
    protection_content = render_template('templates/fr/protection.md', context)
    cable_sizing_content = render_template('templates/fr/cable_sizing.md', context)
    grounding_content = render_template('templates/fr/grounding.md', context)
    calculations_content = render_template('templates/fr/calculations.md', context)
    
    # Combine all content into the final document
    final_document = f"""---
math: true
mathjax: true
layout: post
---

{equipment_content}

{array_config_content}

{protection_content}

{cable_sizing_content}

{grounding_content}

{calculations_content}

"""
    
    # Write the final document to file
    with open('output/report.md', 'w') as f:
        f.write(final_document)
    
    print("Context:", context)
    print("Document generation completed.")
    print("Components:", components)
    print("Document generation completed.")

if __name__ == "__main__":
    main()
