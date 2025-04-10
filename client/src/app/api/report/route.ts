import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const reportPath = path.join(process.cwd(), '../server/generated_report.md');
    const content = await fs.readFile(reportPath, 'utf8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error reading report file:', error);
    return new NextResponse('Error loading report', { status: 500 });
  }
}
