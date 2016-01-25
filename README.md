# img-upload for CKEditor
CKEditor <strong>img-upload</strong> supports multiple images upload via both drag-n-drop and file input. It uploads files on AWS S3 bucket.

## Install/Usage
Download the plugin and copy the downloaded directory under `plugins` folder of CKEditor.

Add the plugin name to CKEditor's extraPlugins property inside of `config.js`
```
config.extraPlugins = 'img-upload';
```

Add the configuration settings in `config.js` after adding the plugin

```
config.imgUploadConfig = {
      settings: {
          bucket: 'bucket-name',
          region: 'region-name',
          accessKeyId: 'access-key',
          secretAccessKey: 'secret-access-key'
      }
};
```
That's all. Works out of the box once you have correctly configured it. Make sure to set appropriate access permissions on your S3 bucket for upload to work.

Plugin also checks for image dimensions after upload is done and sets image width to 600 if image width is more than than. Currently it's hard-coded (See TBD section)

### TBD
* Image validation before upload
* Make image maxWidth configurable via plugin settings