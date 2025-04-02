const JWT = process.env.PINATA_JWT;

/**
 * Uploads a Base64-encoded string as a file to IPFS using Pinata's pinning service.
 *
 * This function converts a Base64-encoded string into a binary file, creates a FormData object,
 * and sends a POST request to Pinata's API to upload the file to IPFS. The uploaded file will be pinned
 * on IPFS for long-term storage.
 *
 * @param {string} base64String - The Base64-encoded string representing the file to be uploaded.
 *
 * @returns {Promise<void>} A promise that resolves when the upload is complete.
 *
 * @throws Will log an error if the upload process fails.
 *
 * @example
 * const base64File = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...";
 * uploadBase64(base64File)
 *   .then(() => console.log('File uploaded to IPFS'))
 *   .catch(error => console.error('IPFS upload failed:', error));
 */
export async function uploadBase64(base64String: string): Promise<void> {
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
