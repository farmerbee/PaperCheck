; (function (document) {
    const oUploadElm = document.getElementById('files'),
        oLabel = document.getElementsByClassName('input-label')[0],
        oUploadInfo = document.getElementsByClassName('upload-info')[0],
        oUploadCounter = document.getElementsByClassName('upload-counter')[0],
        oTable = document.getElementsByClassName('result-tb')[0],
        oLoading = document.getElementsByClassName('loading-mod')[0];

    function init() {
        bindEvent();
    }

    function bindEvent() {
        oUploadElm.addEventListener('change', handleUpload);
    }

    function handleUpload() {
        oLabel.className = 'input-label';
        oUploadInfo.className += ' active';
        const files = this.files,
            fileNum = files.length;
        let counter = 0;

        const checkStatus = setInterval(() => {
            if (counter == fileNum) {
                clearInterval(checkStatus);
                oLabel.className += ' active'
                oUploadInfo.className = 'upload-info';
            }
        }, 1000);


        Array.prototype.forEach.call(files, (file, index) => {
            const fileName = file.name;
            if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
                alert(`只支持doc,docx文件，${fileName}文件类型错误`)
                counter++;
                return
            }
            const fd = new FormData(),
                xhr = new XMLHttpRequest();

            fd.append('file', file, file.name);
            xhr.open('post', '/upload');
            xhr.onprogress = function (e) {
                if (e.loaded == e.total) {
                    counter++;
                    oUploadCounter.innerHTML = `${file.name.split('.')[0]}已上传`
                }
            }

            xhr.onreadystatechange = function () {
                oTable.className += ' active';
                oLoading.className += ' active';

                if (xhr.readyState == 4) {
                    let recurReq = setInterval(() => {
                        let xhr = new XMLHttpRequest();
                        xhr.open('GET', `/index?name=${fileName}`);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4) {
                                console.log(xhr.status);
                                console.log(xhr.responseText);
                                clearInterval(recurReq);
                            }
                        }

                        xhr.send();

                    }, 1000);
                }
            }

            xhr.send(fd);
        })

    }



    window.onload = function () {
        init();
    }
})(document)