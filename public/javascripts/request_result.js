
; (function (document) {
    const oUploadElm = document.getElementById('files'),
        oLabel = document.getElementsByClassName('input-label')[0],
        oUploadInfo = document.getElementsByClassName('upload-info')[0],
        oUploadCounter = document.getElementsByClassName('upload-counter')[0],
        oTable = document.getElementsByClassName('result-tb')[0],
        oTbody = oTable.getElementsByTagName('tbody')[0],
        oLoading = document.getElementsByClassName('loading-mod')[0],
        oDownload = document.getElementsByClassName('download-xls')[0];

    function init() {
        activateModal();
        activateUploading();
        oUploadInfo.innerHTML = '正在加载本IP文件信息';
        oTable.className = 'result-tb';
        bindEvent();
    }

    function bindEvent() {
        window.addEventListener('load', getResults);
        oUploadElm.addEventListener('change', handleUpload);
        oDownload.addEventListener('click', handleDownload);
    }

    function handleDownload() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/download');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                window.location.href = '/download';
                oLabel.className = 'input-label active';
                oLabel.innerHTML = '请选择要上传的文件夹';
                return;
            }
        }
        xhr.send();
    }
    // 页面加载10s轮询请求数据
    function getResults() {

        const recurReq = setInterval(() => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/index?files=please');
            //重新渲染列表
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                    const fileInfo = JSON.parse(xhr.responseText);
                    const files = fileInfo.files;
                    if (files.length < fileInfo.number) {
                        if (files.length > 0) {
                            activateModal();
                            resumeUploading();
                            oTbody.innerHTML = '';
                            files.forEach((file, index) => {
                                renderTable(file[0], file[1], index + 1, fileInfo.number);
                            })
                        }
                    } else if (files.length == fileInfo.number) {
                        oUploadInfo.className = 'upload-info';
                        oLabel.className = 'input-label';
                        oDownload.className += ' active';
                        oTable.className = 'result-tb active';
                        removeModal();
                        oTbody.innerHTML = '';
                        files.forEach((file, index) => {
                            renderTable(file[0], file[1], index + 1, fileInfo.number);
                        })
                        clearInterval(recurReq);
                    }
                }
            }
            xhr.send();
        }, 10000);

    }


    function handleUpload(e) {
        activateUploading();
        const files = this.files,
            fileNum = files.length;
        let counter = 0,
            errCounter = 0;


        const checkStatus = setInterval(() => {
            // 文件传输完成后，请求服务器开始处理
            if (counter + errCounter == fileNum && errCounter != fileNum) {
                resumeUploading();
                activateModal();
                oTable.className = 'result-tb';
                oLabel.innerHTML = `已上传${counter}个文档，正在处理中`;
                setTimeout(() => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/process');
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            oUploadInfo.className = 'upload-info';
                            oLabel.className = 'input-label';
                            setTimeout(() => {
                                oDownload.className += ' active';
                            }, 10000);
                            removeModal();
                        } else if (xhr.readyState == 4 & xhr.status == 250) {
                            alert('服务器正被占用，请稍后再试！');
                            oLabel.innerHTML = '请选择要上传的文件夹';
                            removeModal();
                        }
                    }

                    xhr.send(`number=${counter}`);
                    console.log('send');
                }, 2000)

                clearInterval(checkStatus);
            } else if (errCounter == fileNum) {
                clearInterval(checkStatus);
                alert('没有可以处理的word文档');
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
            xhr.open('POST', '/upload');
            xhr.onprogress = function (e) {
                if (e.loaded == e.total) {
                    counter++;
                    oUploadCounter.innerHTML = `${file.name.split('.')[0]}已上传`
                }
            }

            xhr.onreadystatechange = function () {
                // activateModal();

                if (xhr.readyState == 4) {
                    // 等文件传输完成后，轮询30S请求服务器查看完成状态
                    let step = 10000;
                    let completeInt = setInterval(() => {
                        if (errCounter + counter == fileNum) {
                            let recurReq = setInterval(() => {
                                let xhr = new XMLHttpRequest();
                                xhr.open('GET', `/index?name=${fileName}`);
                                xhr.onreadystatechange = function () {
                                    if (xhr.readyState == 4 && xhr.status == 200) {
                                        oTable.className = 'result-tb active';
                                        renderTable(fileName, xhr.responseText, fileNum);
                                        clearInterval(recurReq);
                                    } else {
                                    }
                                }

                                xhr.send();
                            }, 30000);
                            clearInterval(completeInt);
                        }
                    }, 2000);

                }
            }

            xhr.send(fd);
        })

        if (errCounter) {
            alert(`有${errCounter}个文件为非word文档，将不会处理`);
        }


    }


    function activateModal() {
        oTable.className = 'result-tb active';
        oLoading.className += ' active';
    }

    function removeModal() {
        oLoading.className = 'loading-mod';
    }

    function activateUploading() {
        oLabel.className = 'input-label';
        oUploadInfo.className += ' active';
    }

    function resumeUploading() {

        oLabel.className += ' active';
        oUploadInfo.className = 'upload-info';
    }

    function renderTable(fileName, ratio, seqNumber, fileNum) {
        let completed = seqNumber;
        oLabel.innerHTML = `已完成${completed}个文件，还有${fileNum - completed}个待处理`
        let tr = `
        <tr>
            <td>${seqNumber}</td>
            <td>${fileName.split('.')[0]}</td>
            <td>${ratio}</td>
        </tr>`;
        oTbody.innerHTML += tr;
    }

    init();
})(document)