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

var insertDB = function(dbName = defaultDbName, tableName = defaultTableName, key){
  var dbRequest = indexedDB.open(dbName);
  var version;

  dbRequest.onupgradeneeded = function(event){
    var db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})  
      alert('DBにテーブルを追加しました。テーブル名 : ' + tableName);
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    var db = event.target.result;
    var trans = db.transaction(tableName, 'readwrite');
    var store = trans.objectStore(tableName);
    var data = {val_timestamp: 'aaabbb'}
    var putRequest = store.put(data);

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
