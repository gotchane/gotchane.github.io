document.addEventListener('DOMContentLoaded', function() {
  initializeDB()
  showQrScanResult()
  const video = document.createElement("video");
  const canvasElement = document.getElementById("canvas");
  const canvas = canvasElement.getContext("2d");
  const loadingMessage = document.getElementById("loadingMessage");
  const outputContainer = document.getElementById("output");
  const outputData = document.getElementById("outputData");
  
  const drawBox = (begin, b, c, d, color) => {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(b.x, b.y);
    canvas.lineTo(c.x, c.y);
    canvas.lineTo(d.x, d.y);
    canvas.lineTo(begin.x, begin.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }
  
  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment", frameRate: { ideal: 2, max: 10 } } })
    .then(function(stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();
      frame = requestAnimationFrame(tick);
    });
  
  const tick = () => {
    loadingMessage.innerText = "⌛ Loading video...";
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      loadingMessage.hidden = true;
      canvasElement.hidden = false;
      outputContainer.hidden = false;
  
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      var code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        drawBox(
          code.location.topLeftCorner,
          code.location.topRightCorner,
          code.location.bottomRightCorner,
          code.location.bottomLeftCorner,
          code.location.topLeftCorner,
          "#FF3B58"
        );
        outputData.parentElement.hidden = false;
        outputData.innerText = code.data;
        insertQrScanResult(code.data);
        document.getElementById("qr-scan-result").innerHTML = code.data
        alert('スキャンが完了しました。')
      } else {
        outputData.parentElement.hidden = true;
      }
    }
    frame = requestAnimationFrame(tick);
  }
})

const showQrScanResult = function() {
  let dbRequest = indexedDB.open(defaultDbName);
  let tableName = defaultTableName

  dbRequest.onsuccess = function(event) {
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);

    let ul = document.getElementById('qr-scan-result-list')
    ul.innerHTML = ''

    store.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;
      if (cursor) {
        console.log("result:" + cursor.key + " Text: " + cursor.value.scan_text);
        let li = document.createElement('li')
        li.textContent = cursor.key
        ul.appendChild(li)
        cursor.continue();
      }
    };
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const insertQrScanResult = function(scanData) {
  let dbRequest = indexedDB.open(defaultDbName);
  let tableName = defaultTableName
  let key = defaultKey
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);
    let data = {scan_text: scanData}
    let putRequest = store.put(data);

    db.close();
    console.log('スキャンデータ追加完了');
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const defaultDbName = 'qrDb'

const initializeDB = () => {
  createDB()
  updateDB()
}

const createDB = function(dbName = defaultDbName){
  let dbRequest = indexedDB.open(dbName);

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    console.log('DB 作成完了 DB名 : ' + dbName);
  }

  dbRequest.onsuccess = function(event){
    console.log('DB接続完了 DB名 : ' + dbName)
    let db = event.target.result;
    db.close();
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const defaultDbVer = 2
const defaultTableName = 'qr_results'
const defaultKey = 'scan_text'

const updateDB = function(
    dbName = defaultDbName,
    dbVer = defaultDbVer,
    tableName = defaultTableName,
    key = defaultKey
  )
{
  let dbRequest = indexedDB.open(dbName, dbVer);
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
      console.log('DBにテーブルを追加しました。テーブル名 : ' + tableName + ' / keyPath : ' + key);
    }
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    db.close();
    alert('スキャン準備が完了しました。カメラ利用を有効にして利用開始してください。')
  }

  dbRequest.onerror = function(event){
    alert('スキャン準備に失敗しました。');
  }
}

const insertDB = function(dbName = defaultDbName, tableName = defaultTableName, key){
  let dbRequest = indexedDB.open(dbName);
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
      console.log('DBにテーブルを追加しました。テーブル名 : ' + tableName);
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);
    let data = {scan_text: 'aaabbb'}
    let putRequest = store.put(data);

    db.close();
  }

  dbRequest.onerror = function(event){
      console.log('DBの接続に失敗しました。');
  }
}

const clearDB = function(dbName = defaultDbName, tableName = defaultTableName){
  let confirmClearDB = window.confirm('本当にデータを削除しますか？')
  if(!confirmClearDB) { return }

  let dbRequest = indexedDB.open(dbName);

  dbRequest.onsuccess = function(event) {
    let db = event.target.result;
    let trans = db.transaction(tableName, "readwrite");

    trans.oncomplete = function(event) {
      let ul = document.getElementById('qr-scan-result-list')
      ul.innerHTML = ''
      alert('データ削除処理完了')
    }

    trans.onerror = function(event) {
      alert('データ削除処理失敗')
    }

    let objectStore = trans.objectStore(tableName)
    let objectStoreRequest = objectStore.clear()

    objectStoreRequest.onsuccess = function(event) {
      console.log('データ削除成功')
    }
  }
}

const deleteDB = function(dbName = defaultDbName){
  let confirmResult = window.confirm('本当に初期化しますか？データが全て削除されます。')
  if(!confirmResult) { return }
  let deleteRequest = indexedDB.deleteDatabase(dbName);

  deleteRequest.onsuccess = function(event){
    let ul = document.getElementById('qr-scan-result-list')
    ul.innerHTML = ''
    alert('データ削除完了')
  }

  deleteRequest.onerror = function(){
    alert('データ削除失敗')
  }
}
