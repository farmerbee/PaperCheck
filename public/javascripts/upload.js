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
        // oLabel.className = 'input-label';
        // oUploadInfo.className += ' active';
        activateUploading();
        const files = this.files,
            fileNum = files.length;
        let counter = 0,
            errCounter = 0;

        const checkStatus = setInterval(() => {
            if (counter + errCounter == fileNum && errCounter != fileNum) {
                // oLabel.className += ' active';
                resumeUploading();
                oLabel.innerHTML = `已上传${counter}个文档，正在处理中`;
                // oUploadInfo.className = 'upload-info';
            } else if (errCounter == fileNum) {
                clearInterval(checkStatus);
                alert('没有可以处理的word文档');
                // oLabel.className += ' active';
                // oUploadInfo.className = 'upload-info'
                resumeUploading();
            }
        }, 1000);


        Array.prototype.forEach.call(files, (file, index) => {
            const fileName = file.name;
            if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
                errCounter++;
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
                // oTable.className += ' active';
                // oLoading.className += ' active';
                activateModal();

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

        if (errCounter) {
            alert(`有${errCounter}个文件为非word文档，将不会处理`);
        }

        if(counter){
            // xhr = new XMLHttpRequest();
            // xhr.open('/process')
        }

    }

    function activateModal(){
        oTable.className += ' active';
                oLoading.className += ' active';
    }

    function activateUploading(){
        oLabel.className = 'input-label';
        oUploadInfo.className += ' active';
    }

    function resumeUploading(){
        oLabel.className += ' active';
        oUploadInfo.className = 'upload-info';
    }

    window.onload = function () {
        init();
    }
})(document)