
; (function (document) {
    const oUploadElm = document.getElementById('files'),
        oLabel = document.getElementsByClassName('input-label')[0],
        oUploadInfo = document.getElementsByClassName('upload-info')[0],
        oUploadCounter = document.getElementsByClassName('upload-counter')[0],
        oTable = document.getElementsByClassName('result-tb')[0],
        oLoading = document.getElementsByClassName('loading-mod')[0],
        oDownload = document.getElementsByClassName('download-xls')[0];

    function init() {
        bindEvent();
    }

    function bindEvent() {
        oUploadElm.addEventListener('change', handleUpload);
        oDownload.addEventListener('click', handleDownload);
    }

    function handleDownload() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/download');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                window.location.href = '/download';
                return;
            }
        }
        xhr.send();
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
                            oDownload.className += ' active';
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

    function renderTable(fileName, ratio, fileNum) {
        let seqNumber = 1;
        const lastTr = oTable.getElementsByTagName('tr');
        const lfTd = lastTr[lastTr.length - 1].getElementsByTagName('td');
        if (lfTd.length > 0) {
            let completed = parseInt(lfTd[0].innerText);
            seqNumber += completed;
            oLabel.innerHTML = `已完成${completed + 1}个文件，还有${fileNum - completed}待处理`
        }
        let tr = `
        <tr>
            <td>${seqNumber}</td>
            <td>${fileName.split('.')[0]}</td>
            <td>${ratio}</td>
        </tr>`;
        oTable.innerHTML += tr;
    }

    window.onload = function () {
        init();
    }
})(document)