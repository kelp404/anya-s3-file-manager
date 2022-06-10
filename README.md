# anya-s3-file-manager
An AWS S3 file manager.  
It supports archive files into a zip then download it.
And supports find files by keywords.

![search](_screenshot/search.png)

## Installation
```bash
git clone https://github.com/kelp404/anya-s3-file-manager.git
cd anya-s3-file-manager
npm install
npm run build
```


## Start
### 1. Update S3 settings.
Open `./config/staging.js` and modify it.
```js
S3: {
	KEY: 'Access key ID',
	SECRET: 'Secret access key',
	BUCKET: 's3 bucket name',
	REGION: 'us-west-2',
},
```
### 2. Launch the website
```bash
npm start
```
