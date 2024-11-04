const fs = require('fs');
const FormData = require('form-data');
const rfs = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const got = require('got');

const JWT = process.env.PINATA_JWT;

/**
 * Pins a directory and its contents to IPFS using Pinata's pinning service.
 *
 * This function reads all files in the specified directory, creates a FormData object,
 * and sends a POST request to Pinata's API to upload the files to IPFS. Each file is streamed
 * for efficient uploading. The function also tracks upload progress.
 *
 * @returns {Promise<void>} A promise that resolves when the upload is complete.
 *
 * @throws Will log an error if the pinning process fails.
 *
 * @example
 * pinDirectoryToPinata()
 *   .then(() => console.log('Directory pinned to IPFS'))
 *   .catch(error => console.error('Pinning failed:', error));
 */

export const pinDirectoryToPinata = async () => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const src = 'PATH_TO_FOLDER';
  var status = 0;
  try {
    const { dirs, files } = await rfs.read(src);

    let data = new FormData();

    for (const file of files) {
      data.append(`file`, fs.createReadStream(file), {
        filepath: basePathConverter(src, file),
      });
    }

    const response = await got(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: data,
    }).on('uploadProgress', (progress: any) => {
      console.log(progress);
    });

    console.log(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
  }
};
