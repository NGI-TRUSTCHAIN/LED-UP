const JWT = process.env.PINATA_JWT;

/**
 * Uploads a file from a given URL to IPFS using Pinata's pinning service.
 *
 * This function fetches a file from the specified URL, converts it to a Blob, and then creates
 * a File object. It sends a POST request to Pinata's API to pin the file to IPFS. The response
 * from the API is logged for reference.
 *
 * @param {string} url - The URL of the file to be uploaded to IPFS.
 *
 * @returns {Promise<void>} A promise that resolves when the upload is complete.
 *
 * @throws Will log an error if the upload process fails.
 *
 * @example
 * const fileUrl = 'https://example.com/path/to/file.jpg';
 * uploadByURL(fileUrl)
 *   .then(() => console.log('File uploaded to IPFS'))
 *   .catch(error => console.error('Upload failed:', error));
 */

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
