function openQRCamera(node) {
  let reader = new FileReader();
  reader.onload = function() {
    node.value = "";
    qrcode.callback = function(res) {
      if(res instanceof Error) {
        alert("QR コード画像が見つかりません。QR コードを含めた画像を指定してください。");
      } else {
        node.parentNode.previousElementSibling.value = res;
        document.getElementById('qr-scan-result').innerHTML = res;
        insertQrScanResult(res)
      }
    };
    qrcode.decode(reader.result);
  };
  reader.readAsDataURL(node.files[0]);
}

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
        console.log("result:" + cursor.key + " Text: " + cursor.value.val_timestamp);
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
      alert('スキャンデータを追加 テーブル名 : ' + tableName);
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);
    let data = {val_timestamp: scanData}
    let putRequest = store.put(data);

    db.close();
  }

  dbRequest.onerror = function(event){
      console.log('DBの接続に失敗しました。');
  }
}

const defaultDbName = 'qrDb'

const createDB = function(dbName = defaultDbName){
  let dbRequest = indexedDB.open(dbName);

  dbRequest.onupgradeneeded = function(event){
      let db = event.target.result;
      alert('DB 作成完了 DB名 : ' + dbName);
  }

  dbRequest.onsuccess = function(event){
      alert('DB接続完了 DB名 : ' + dbName)
      let db = event.target.result;
      db.close();
  }

  dbRequest.onerror = function(event){
      console.log('DBの接続に失敗しました。');
  }
}

const defaultDbVer = 2
const defaultTableName = 'qr_results'
const defaultKey = 'val_timestamp'

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
      alert('DBにテーブルを追加しました。テーブル名 : ' + tableName + ' / keyPath : ' + key);
    }
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    db.close();
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const insertDB = function(dbName = defaultDbName, tableName = defaultTableName, key){
  let dbRequest = indexedDB.open(dbName);
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
      alert('DBにテーブルを追加しました。テーブル名 : ' + tableName);
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);
    let data = {val_timestamp: 'aaabbb'}
    let putRequest = store.put(data);

    db.close();
  }

  dbRequest.onerror = function(event){
      console.log('DBの接続に失敗しました。');
  }
}

const deleteDB = function(dbName = defaultDbName){
  let deleteRequest = indexedDB.deleteDatabase(dbName);

  deleteRequest.onsuccess = function(event){
    alert('DBの削除完了 DB名 : ' + dbName)
  }

  deleteRequest.onerror = function(){
    alert('DBの削除失敗 DB名 : ' + dbName)
  }
}
