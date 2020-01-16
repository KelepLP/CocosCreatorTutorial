const fileUtil = require('FileUtil');
const crypto = require('crypto');
const fs = require('fs');
var path = require('path');

let manifest = {
    packageUrl: 'http://localhost/tutorial-hot-update/remote-assets/',
    remoteManifestUrl: 'http://localhost/tutorial-hot-update/remote-assets/project.manifest',
    remoteVersionUrl: 'http://localhost/tutorial-hot-update/remote-assets/version.manifest',
    version: '1.0.0',
    assets: {},
    searchPaths: []
};

let dest = './remote-assets/';
let src = './jsb/';

function initManifest(configPath) {
    let data = JSON.parse(fileUtil.read(configPath));
    //得到远程url
    manifest.packageUrl = data.packageUrl;
    manifest.remoteManifestUrl = data.packageUrl + 'project.manifest';
    manifest.remoteVersionUrl = data.packageUrl + 'version.manifest';
    //版本信息
    manifest.version = data.version;
    //构建后的对应目录
    src = data.src;

    //目的目录
    desp = data.des;


}

function md5InfoFromDir(dir, obj) {
    function fn(subpath) {
        let stat, size, md5, compressed, relative;
        stat = fs.statSync(subpath);
        size = stat['size'];
        // md5 = crypto.createHash('md5').update(fs.readFileSync(subpath, 'binary')).digest('hex');//返回的并非二进制类型，而是String。这会导致非文本文件md5计算错误
        md5 = crypto.createHash('md5').update(fs.readFileSync(subPath)).digest('hex');
        compressed = path.extname(subpath).toLowerCase() === '.zip';
        relative = path.relative(src, subpath);
        relative = relative.replace(/\\/g, '/');
        relative = encodeURI(relative);
        obj[relative] = {
            'size': size,
            'md5': md5
        };
        if (compressed) {
            obj[relative].compressed = true;
        }
    }
    fileUtil.readDir(dir, fn);
}

function main() {
    initManifest('./GameConfig.json');

    md5InfoFromDir(path.join(src, 'src'), manifest.assets);
    md5InfoFromDir(path.join(src, 'res'), manifest.assets);

    let length = desp.length;
    for (let i = 0; i < length; i++) {
        let des = desp[i], destManifest;
        destManifest = path.join(des, 'project.manifest');
        fileUtil.write(destManifest, JSON.stringify(manifest));
    }

    delete manifest.assets;
    delete manifest.searchPaths;

    for (let i = 0; i < length; i++) {
        let des = desp[i], destVersion;
        destVersion = path.join(des, 'version.manifest');
        fileUtil.write(destVersion, JSON.stringify(manifest));
    }
}






