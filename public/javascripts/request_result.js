
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
    // 页面加载20s轮询请求数据
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
        }, 20000);

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
        oLabel.innerHTML = `已完成${completed}个文件，还有${fileNum - completed}待处理`
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