const JWT = 'YOUR_PINATA_JWT';

export async function uploadBase64(base64String: string) {
  try {
    const buffer = Buffer.from(base64String, 'base64');
    const blob = new Blob([buffer]);
    const file = new File([blob], 'file');
    const data = new FormData();
    data.append('file', file);

    const upload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: data,
    });
    const uploadRes = await upload.json();
    console.log(uploadRes);
  } catch (error) {
    console.log(error);
  }
}

// await uploadBase64('SGVsbG8gZnJvbSBQaW5hdGEhIDop');
