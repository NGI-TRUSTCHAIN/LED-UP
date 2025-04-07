import { NextRequest, NextResponse } from 'next/server';
import { upload } from '@/lib/actions/file';

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const consent = parseInt(formData.get('consent') as string);
      const metadataStr = formData.get('metadata') as string;
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file found in request' },
          { status: 400 }
        );
      }

      // Read the file as array buffer
      const fileBuffer = await file.arrayBuffer();
      
      // Use the server action to upload the file
      const result = await upload({ 
        consent, 
        file: {
          data: Buffer.from(fileBuffer),
          name: file.name,
          type: file.type,
          size: file.size,
        },
        metadata
      });
      
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        data: result
      });
    } 
    else {
      // Handle JSON request for backward compatibility
      try {
        const body = await request.json();
        const { consent, data, producer } = body;
        
        if (!data) {
          return NextResponse.json(
            { error: 'Missing data in request body' },
            { status: 400 }
          );
        }

        // Use the server action to upload the file
        const result = await upload({ consent, data });
        
        return NextResponse.json(result);
      } catch (jsonError) {
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error uploading file:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}