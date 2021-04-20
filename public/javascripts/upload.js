
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
    }

    function handleUpload() {
        activateUploading();
        const files = this.files,
            fileNum = files.length;
        let counter = 0,
            errCounter = 0;

        console.log('filenum', fileNum);

        const checkStatus = setInterval(() => {
            if (counter + errCounter == fileNum && errCounter != fileNum) {
                console.log('counter', counter)
                resumeUploading();
                oLabel.innerHTML = `已上传${counter}个文档，正在处理中`;

                const xhr = new XMLHttpRequest();
                xhr.open('post', '/process');
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
            xhr.open('post', '/upload');
            xhr.onprogress = function (e) {
                if (e.loaded == e.total) {
                    counter++;
                    oUploadCounter.innerHTML = `${file.name.split('.')[0]}已上传`
                }
            }

            xhr.onreadystatechange = function () {
                activateModal();

                if (xhr.readyState == 4) {
                    console.log('post end');
                    let recurReq = setTimeout(() => {
                        let xhr = new XMLHttpRequest();
                        xhr.open('GET', `/index?name=${fileName}`);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                console.log(fileName, xhr.responseText);
                                renderTable(fileName, xhr.responseText);
                                // clearInterval(recurReq);
                            } else {
                                // console.log(fileName, 'not ready:', xhr.status);
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

    function renderTable(fileName, ratio) {
        let seqNumber = 1;
        const lastTr = oTable.getElementsByTagName('tr');
        const lfTd = lastTr[lastTr.length - 1].getElementsByTagName('td');
        if (lfTd.length > 0) {
            seqNumber += parseInt(lfTd[0].innerText);
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