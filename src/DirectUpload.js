import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'


const BASE_BACKEND_URL = 'http://progamacionweb.ddns.net:8000';
let image = undefined;


function Image({ image_url }) {
  return (
    <img className="h-[200px] w-[200px] rounded-2xl object-cover" src={ image_url } alt='uploaded' />
  );
}

const directUploadStart = ({ fileName, fileType }) => {
  return axios.post(
    `${BASE_BACKEND_URL}/api/files/upload/direct/start/`, { file_name: fileName, file_type: fileType }, {
      headers: { 'Content-Type': 'application/json' }

    }
  );
};

const directUploadDo = ({ data, file, setOriginal }) => {
  const postData = new FormData();

  for (const key in data?.fields) {
    postData.append(key, data.fields[key]);
  }

  image = data.url + data.fields['key']
  setOriginal(data.url + data.fields['key']);
  postData.append('file', file);


  return axios
    .post(data.url, postData, { 'Content-Type': 'application/octet-stream' })
    .then(() => Promise.resolve({ fileId: data.id }));
};

const directUploadFinish = ({ data, name }) => {
  console.log("ENTROOOOOO")
  console.log(name)
  return axios.post(
    `${BASE_BACKEND_URL}/api/files/upload/direct/finish/`, { file_id: data.id, file_name: name }
  );
};


const DirectUploadExample = () => {
  const [message, setMessage] = useState();
  const [original, setOriginal] = useState();


  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles[0]);
    const file = acceptedFiles[0];

    if (file) {
      directUploadStart({
          fileName: file.name,
          fileType: file.type
        })
        .then((response) =>
          directUploadDo({ data: response.data, file, setOriginal })
          .then(() => directUploadFinish({ data: response.data, name: response.data.fields['key'] }))
          .then(() => {
            setMessage('File upload completed!');

            //subscribeEmail();
            const root = ReactDOM.createRoot(document.getElementById('container'));
            console.log(image)
            root.render(<Image image_url={image} />);

            const small = ReactDOM.createRoot(document.getElementById('small'));
            const newImage = response.data.fields['key'].replace("original/", "small/")
            const urlNewImage = response.data.url + newImage
            console.log(urlNewImage)

            small.render(<p>Procesando imagen</p>)

            setTimeout(() => {
              small.render(<Image image_url={urlNewImage} />)
            }, 10000);

          })
        )
        .catch((error) => {
          setMessage('File upload failed! ' + error);
        });
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold" >Sube imagen a S3</h1>
      
      {original!=null?<div className="shadow-2xl w-3/4 h-[350px] my-8 flex flex-col items-center justify-center border-dashed border-2 bg-white aspect-video">
      <div>{message} {original}</div>
     <div className="flex flex-row gap-4 items-center justify-center">
     <div id="container">
     
     </div>
     <div id="small">
     
     </div>
     </div>
     <a href="/" className="bg-blue-600 my-2
     text-white px-4 py-2 font-bold rounded-full">Subir otra imagen</a>
      </div>
      :<div className="shadow-2xl w-3/4 h-[250px] my-8 flex items-center justify-center border-dashed border-2 bg-white aspect-video" {...getRootProps()}>
        <input id="input" accept="image/*" {...getInputProps()} />
        {
          isDragActive ?
            <p className="font-bold text-2xl text-blue-500">Suelta la imagen aquí ...</p> :
            <div className="flex flex-col items-center justify-center">
              <button className="bg-blue-600 text-white px-4 py-2 font-bold pointer-event-none rounded-full">Subir imagen</button>
              <p>o arrastra la imagen</p>
            </div>
        }
      </div>}
    </div>
  );
};



export default DirectUploadExample;

// export NODE_OPTIONS=--openssl-legacy-provider
