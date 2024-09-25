const JWT = 'YOUR_PINATA_JWT';

export async function uploadByURL(url: string) {
  try {
    const urlStream = await fetch(url);
    const arrayBuffer = await urlStream.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
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

// await uploadByURL('https://pocketcast.cloud/og.png');
