const fs = require('fs');
const FormData = require('form-data');
const rfs = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const got = require('got');

// import rfs from 'recursive-fs';
// import basePathConverter from 'base-path-converter';
// import got from 'got';

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
        Authorization: 'Bearer PINATA_API_JWT',
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

// pinDirectoryToPinata();
