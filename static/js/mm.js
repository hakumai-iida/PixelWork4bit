//---------------------------------------------
// 定数：エラー番号
//---------------------------------------------
const mm_error = {
  SUCCESS: 0,                       // 成功（※エラーなし）

  WEB3_NOT_ENABLE: 1,               // web3が利用できない（※環境にウォレットへのアクセス機構がない）
  CHAIN_ID_NOT_VALID: 2,            // チェーンIDが不正（※[TARGET_CHAIN_ID]につないでいない）
  CONNECTED_ACCOUNT_NOT_FOUND: 3,   // 接続済みのアカウントがみつからない
  SIGN_FAILED: 4,                   // 署名が失敗（※ユーザーがキャンセルした等）
  SC_READ_FAILED: 5,                // スマートコントラクトの読み込み処理に失敗
  SC_READ_UNKNOWN: 6,               // 不明な読み込み処理
  SC_WRITE_FAILED: 7,               // スマートコントラクトの書き込み処理に失敗（※ユーザーがキャンセルした等）
  SC_WRITE_UNKNOWN: 8,              // 不明な書き込み処理

  UNKNOWN: 999                      // この値が来たら何か変
};

//---------------------------------------------
// 定数：接続先(チェインIDにあわせておく)
//---------------------------------------------
const mm_chain = {
  UNDEFINED: 0,
  POLYGON: 137,
  MUMBAI: 80001
}

//---------------------------------------------
// コンフィグ
//---------------------------------------------
var mm_config = {
  WEB3_GETTER: null,      // web3の取得
  TARGET_CHAIN_ID: 0,     // 接続対象のネットワークID：mm_chain
  CONTRACT_ADDRESS: "",   // コントラクトアドレス
};

//---------------------------------------------
// コンフィグ初期化
//---------------------------------------------
function mm_config_initialize( web3Getter, chainId ){
  if( ! web3Getter ){
    console.log( "mm_config_initialize: invalid web3Getter" );
    return( false );
  }
  mm_config.WEB3_GETTER = web3Getter;

  // ネットワークごとの設定
  switch( chainId ){

  case mm_chain.POLYGON:
    mm_config.CONTRACT_ADDRESS = "0xF42dA926C5826FEb98bE9c12c3B2bC56b00411B0";
    break;

  case mm_chain.MUMBAI:
    mm_config.CONTRACT_ADDRESS = "0x467Aae6B455ED4FA3eF584ADdbAcfc34cf4ED0eC";
    break;

  case mm_chain.MAINNET:
  case mm_chain.RINKEBY:
  default:
    console.log( "mm_config_initialize: unsupported chainId = " + chainId );
    return( false );
  }

  // ここまできたら成功
  mm_config.TARGET_CHAIN_ID = chainId;
  return( true );
}

//---------------------------------------------
// 定数：読み込みメソッドID
//---------------------------------------------
const mm_read_method_id = {
  TOTAL_TOKEN: 0,             // 読み込み: totalToken()
  TOTAL_CREATOR: 1,           // 読み込み: totalCreator()
  TOKEN_BIRTHDAY: 2,          // 読み込み: tokenBirthday( tokenId )
  TOKEN_CREATOR: 3,           // 読み込み: tokenCreator( tokenId )
  TOKEN_IMAGE: 4,             // 読み込み: tokenImage( tokenId )
  CREATOR_ID: 5,              // 読み込み: creatorId( creator )
  CREATOR_ADDRESS: 6,         // 読み込み: creatorAddress( cId )
  CREATOR_CREATED_NUM: 7,     // 読み込み: creatorCreatedNum( creator )
  CREATOR_TOKEN_LIST: 8,      // 読み込み: creatorTokenList( creator, pageSize, pageOfs )
  IS_TOKEN_FROZEN: 9,         // 読み込み: isTokenFrozen( tokenId )
  IS_USER_FROZEN: 10,         // 読み込み: isUserFrozen( address )
  READ_TOKEN_URI: 11,         // 読み込み: tokenURI( tokenId )

  UNKNOWN: 999
}

//---------------------------------------------
// 定数：書き込みメソッドID
//---------------------------------------------
const mm_write_method_id = {
  // 書き込み
  MINT_TOKEN: 100,            // 書き込み: mintToken
  FREEZE_TOKEN: 101,          // 書き込み: freezeToken
  FREEZE_USER: 102,           // 書き込み: freezeUser

  UNKNOWN: 999
};

//---------------------------------------------
// 広域パラメータ
//---------------------------------------------
// 状況
var mm_status = {
  errorNo: mm_error.UNKNOWN,
  failedCallback: null,
  readMethodId: mm_read_method_id.UNKNOWN,
  writeMethodId: mm_write_method_id.UNKNOWN,

  isWeb3Enable: false,
  currentChainId: 0,
  currentAccount: "",
  toAccount: "",

  targetId: 0,
  targetAddress: "",
  targetPal: "",
  targetDot: "",
  targetFlag: false,
  targetSize: 0,
  targetOfs: 0,

  resultHash: "",
  resultId: 0,
  resultNum: 0,
  resultUri: "",
  resultDate: 0,
  resultAddress: "",
  resultImage: "",
  resultFlag: false,
  resultList: []
};

//----------------------------
// [窓口] 状況のリセット
//----------------------------
function mm_resetStatus(){
  mm_status.errorNo = mm_error.UNKNOWN,
  mm_status.failedCallback = null;
  mm_readreadMethodId = mm_read_method_id.UNKNOWN,
  mm_writewriteMethodId = mm_write_method_id.UNKNOWN,

  mm_status.isWeb3Enable = false;
  mm_status.currentChainId = 0;
  mm_status.currentAccount = "";
  mm_status.toAccount = "";

  mm_status.targetId = 0;
  mm_status.targetAddress = "";
  mm_status.targetPal = "";
  mm_status.targetDot = "";
  mm_status.targetFlag = false;
  mm_status.targetSize = 0;
  mm_status.targetOfs = 0;

  mm_status.resultHash = "";
  mm_status.resultId = 0;
  mm_status.resultNum = 0;
  mm_status.resultUri = "";
  mm_status.resultDate = 0;
  mm_status.resultAddress = "";
  mm_status.resultImage = "";
  mm_status.resultFlag = false;
  mm_status.resultList = [];
}

//----------------------------
// web3の有効性確認
//----------------------------
// 窓口
function mm_checkWeb3Enable( callback=()=>{}, failedCallback=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = failedCallback;

  _checkWeb3Enable( () => {
    mm_status.errorNo =  mm_error.SUCCESS;
    callback( mm_status );
  });
}

// 実体
function _checkWeb3Enable( callbackForNext=()=>{} ){
  let web3 = mm_config.WEB3_GETTER();
  if( web3 == null ){
    // エラー：
    mm_status.errorNo = mm_error.WEB3_NOT_ENABLE;
    mm_status.failedCallback( mm_status );
    return;
  }

  // 有効性の保持
  mm_status.isMetaMaskEnable = true;

  // 成功
  callbackForNext();
}

//----------------------------
// チェーンIDの確認
//----------------------------
// 窓口
function mm_checkChainId( callback=()=>{}, failedCallback=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = failedCallback;

  _checkWeb3Enable( () => {
    _checkChainId( () =>{
      mm_status.errorNo =  mm_error.SUCCESS;
      callback( mm_status );
    });
  });
}

// 実体
function _checkChainId( callbackForNext=()=>{} ){
  const promise = new Promise((resolve, reject) => {
    _getChainId().then( chainId =>{
      mm_status.currentChainId = chainId;
      if( mm_status.currentChainId == mm_config.TARGET_CHAIN_ID ){
        resolve();
      }else{
        reject();
      }
    });
  });

  promise.then(
    // resolve
    () => {
      // 成功コールバックを呼ぶ
      callbackForNext();
    },
    // reject
    () => {
      // エラー：指定のチェーンに接続していない
      mm_status.errorNo = mm_error.CHAIN_ID_NOT_VALID;
      mm_status.failedCallback( mm_status );
    }
  );
}

// チェーンIDの取得
async function _getChainId(){
  let web3 = mm_config.WEB3_GETTER();
  let chainId;

  try{
    chainId = await web3.eth.getChainId();
  }catch( error ){
    chainId = -1;
  }

  return( chainId );
}

//----------------------------
// 接続済みのアカウントの確認
//----------------------------
// 窓口
function mm_checkConnectedAccount( callback=()=>{}, failedCallback=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = failedCallback;

  _checkWeb3Enable( () => {
    _checkChainId( () => {
      _checkConnectedAccount( () => {
        mm_status.errorNo =  mm_error.SUCCESS;
        callback( mm_status );
      });
    });
  });
}

// 実体
function _checkConnectedAccount( callbackForNext=()=>{} ){
   // イーサリアムの有効化
  const promise = new Promise((resolve, reject) => {
    _getConnectedAccount().then( account =>{
      mm_status.currentAccount = account;
      if( mm_status.currentAccount != null ){
        resolve();
      }else{
        reject();
      }
    });
  });

  promise.then(
    // resolve
    () => {
      // 成功：次へ
      callbackForNext();
    },
    // reject
    () => {
      // エラー：接続済みのアカウントが見つからない
      mm_status.errorNo = mm_error.CONNECTED_ACCOUNT_NOT_FOUND;
      mm_status.failedCallback( mm_status );
    }
  );
}

// アカウント取得
async function _getConnectedAccount(){
  let web3 = mm_config.WEB3_GETTER();
  let account;

  try{
    const accounts = await web3.eth.getAccounts();
    if( accounts.length > 0 ){
      account = accounts[0];
    }
  }catch( error ){
    account = null;
  }

  return( account );
}

//----------------------------------------------------------
// 読み込み：窓口
//----------------------------------------------------------
// totalToken
function mm_read_totalToken( callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.TOTAL_TOKEN;

  _execRead( callback );
}

// totalCreator
function mm_read_totalCreator( callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.TOTAL_CREATOR;

  _execRead( callback );
}

// tokenBirthday( tokenId )
function mm_read_tokenBirthday( tokenId, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.TOKEN_BIRTHDAY;
  mm_status.targetId = tokenId;

  _execRead( callback );
}

// tokenCreator( tokenId )
function mm_read_tokenCreator( tokenId, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.TOKEN_CREATOR;
  mm_status.targetId = tokenId;

  _execRead( callback );
}

// tokenImage( tokenId )
function mm_read_tokenImage( tokenId, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.TOKEN_IMAGE;
  mm_status.targetId = tokenId;

  _execRead( callback );
}

// creatorId( creator )
function mm_read_creatorId( creator, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.CREATOR_ID;
  mm_status.targetAddress = creator;

  _execRead( callback );
}

// creatorAddress( cId )
function mm_read_creatorAddress( creatorId, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.CREATOR_ADDRESS;
  mm_status.targetId = creatorId;

  _execRead( callback );
}

// creatorCreatedNum( creator )
function mm_read_creatorCreatedNum( creator, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.CREATOR_CREATED_NUM;
  mm_status.targetAddress = creator;

  _execRead( callback );
}

// creatorTokenList( creator, pageSize, pageOfs )
function mm_read_creatorTokenList( creator, pageSize, pageOfs, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.CREATOR_TOKEN_LIST;
  mm_status.targetAddress = creator;
  mm_status.targetSize = pageSize;
  mm_status.targetOfs = pageOfs;

  _execRead( callback );
}

// isTokenFrozen
function mm_read_isTokenFrozen( id, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.IS_TOKEN_FROZEN;
  mm_status.targetId = id;

  _execRead( callback );
}

// isUserFrozen
function mm_read_isUserFrozen( address, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.IS_USER_FROZEN;
  mm_status.targetAddress = address;

  _execRead( callback );
}

// tokenURI
function mm_read_tokenURI( id, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.readMethodId = mm_read_method_id.TOKEN_URI;
  mm_status.targetId = id;

  _execRead( callback );
}

//----------------------------------------------------------
// 読み込み：処理実体
//----------------------------------------------------------
// 窓口
function _execRead( callback=()=>{} ){
  _checkWeb3Enable( () => {
    _checkChainId( () => {
      _checkConnectedAccount( () => {
        _read( () => {
          mm_status.errorNo = mm_error.SUCCESS;
          callback( mm_status );
        });
      });
    });
  });
}

//--------------
// 読み込み実体
//--------------
async function _read( callbackForNext=()=>{} ){
  var abi = [
    // totalToken
    {
      "inputs": [],
      "name": "totalToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // totalCreator
    {
      "inputs": [],
      "name": "totalCreator",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // tokenBirthday
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenBirthday",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // tokenCreator
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenCreator",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // tokenImage
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenImage",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // creatorId
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "creatorId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // creatorAddress
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cId",
          "type": "uint256"
        }
      ],
      "name": "creatorAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // creatorCreatedNum
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "creatorCreatedNum",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // creatorTokenList
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageOfs",
          "type": "uint256"
        }
      ],
      "name": "creatorTokenList",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // isTokenFrozen
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "isTokenFrozen",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // isUserFrozen
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isUserFrozen",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },

    // tokenURI
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }

  ];

  let web3 = mm_config.WEB3_GETTER();
  var contract = new web3.eth.Contract( abi, mm_config.CONTRACT_ADDRESS );

  // 読み込み処理の実行
  try{
    // totalToken
    if( mm_status.readMethodId == mm_read_method_id.TOTAL_TOKEN ){
      mm_status.resultNum = await contract.methods.totalToken().call();
    }
    // totalCreator
    else if( mm_status.readMethodId == mm_read_method_id.TOTAL_CREATOR ){
      mm_status.resultNum = await contract.methods.totalCreator().call();
    }
    // tokenBirthday
    else if( mm_status.readMethodId == mm_read_method_id.TOKEN_BIRTHDAY ){
      mm_status.resultDate = await contract.methods.tokenBirthday( mm_status.targetId ).call();
    }
    // tokenCreator
    else if( mm_status.readMethodId == mm_read_method_id.TOKEN_CREATOR ){
      mm_status.resultAddress = await contract.methods.tokenCreator( mm_status.targetId ).call();
    }
    // tokenImage
    else if( mm_status.readMethodId == mm_read_method_id.TOKEN_IMAGE ){
      mm_status.resultImage = await contract.methods.tokenImage( mm_status.targetId ).call();
    }
    // creatorId
    else if( mm_status.readMethodId == mm_read_method_id.CREATOR_ID ){
      mm_status.resultId = await contract.methods.creatorId( mm_status.targetAddress ).call();
    }
    // creatorAddress
    else if( mm_status.readMethodId == mm_read_method_id.CREATOR_ADDRESS ){
      mm_status.resultAddress = await contract.methods.creatorAddress( mm_status.targetId ).call();
    }
    // creatorCreatedNum
    else if( mm_status.readMethodId == mm_read_method_id.CREATOR_CREATED_NUM ){
      mm_status.resultNum = await contract.methods.creatorCreatedNum( mm_status.targetAddress ).call();
    }
    // creatorTokenList
    else if( mm_status.readMethodId == mm_read_method_id.CREATOR_TOKEN_LIST ){
      mm_status.resultList = await contract.methods.creatorTokenList( mm_status.targetAddress, mm_status.targetSize, mm_status.targetOfs ).call();
    }
    // isTokenFrozen
    else if( mm_status.readMethodId == mm_read_method_id.IS_TOKEN_FROZEN ){
      mm_status.resultFlag = await contract.methods.isTokenFrozen( mm_status.targetId ).call();
    }
    // isUserFrozen
    else if( mm_status.readMethodId == mm_read_method_id.IS_USER_FROZEN ){
      mm_status.resultFlag = await contract.methods.isUserFrozen( mm_status.targetAddress ).call();
    }
    // tokenURI
    else if( mm_status.readMethodId == mm_read_method_id.TOKEN_URI ){
      mm_status.resultUri = await contract.methods.tokenURI( mm_status.targetId ).call();
    }

    // 次へ
    callbackForNext();
  }catch(error){
    // エラー：読み込み失敗
    mm_status.errorNo = mm_error.SC_READ_FAILED;
    mm_status.failedCallback( mm_status );
  }
}

//----------------------------
// 書き込み：窓口
//----------------------------
// mintToken
function mm_write_mintToken( pal, dot, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.writeMethodId = mm_write_method_id.MINT_TOKEN;
  mm_status.targetPal = pal;
  mm_status.targetDot = dot;

  _execWrite( callback );
}

// freezeToken
function mm_write_freezeToken( id, flag, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.writeMethodId = mm_write_method_id.FREEZE_TOKEN;
  mm_status.targetId = id;
  mm_status.targetFlag = flag;

  _execWrite( callback );
}

// freezeUser
function mm_write_freezeUser( address, flag, callback=()=>{}, callbackForFailed=()=>{} ){
  mm_resetStatus();
  mm_status.failedCallback = callbackForFailed;

  mm_status.writeMethodId = mm_write_method_id.FREEZE_USER;
  mm_status.targetAddress = address;
  mm_status.targetFlag = flag;

  _execWrite( callback );
}

//----------------------------------------------------------
// 書き込み：処理実体
//----------------------------------------------------------
// 窓口
function _execWrite( callback=()=>{} ){
  _checkWeb3Enable( () => {
    _checkChainId( () => {
      _checkConnectedAccount( () => {
        _write( () => {
          mm_status.errorNo = mm_error.SUCCESS;
          callback( mm_status );
        });
      });
    });
  });
}

//----------------------
// 書き込み実体
//----------------------
async function _write( callbackForNext=()=>{} ){
  var abi = [
    // mintToken
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "palStr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dotStr",
          "type": "string"
        }
      ],
      "name": "mintToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },

    // freezeToken
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "flag",
          "type": "bool"
        }
      ],
      "name": "freezeToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },

    // freezeUser
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "flag",
          "type": "bool"
        }
      ],
      "name": "freezeUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }    

  ];

  let web3 = mm_config.WEB3_GETTER();
  var contract = new web3.eth.Contract( abi, mm_config.CONTRACT_ADDRESS );

  // トランザクションパラメータ
  const txParam = {
    from: mm_status.currentAccount,
  };

  // mintToken
  if( mm_status.writeMethodId == mm_write_method_id.MINT_TOKEN ){
    contract.methods.mintToken( mm_status.targetPal, mm_status.targetDot ).send(txParam)
    .on('transactionHash', function(hash){
      mm_status.resultHash = hash;

      // 次へ
      callbackForNext();
    })
    .on('error', function(error, receipt){
      // エラー：書き込み失敗
      mm_status.errorNo = mm_error.SC_WRITE_FAILED;
      mm_status.failedCallback( mm_status );
    });
  }
  // freezeToken
  else if( mm_status.writeMethodId == mm_write_method_id.FREEZE_TOKEN ){
    contract.methods.freezeToken( mm_status.targetId, mm_status.targetFlag ).send(txParam)
    .on('transactionHash', function(hash){
      mm_status.resultHash = hash;

      // 次へ
      callbackForNext();
    })
    .on('error', function(error, receipt){
      // エラー：書き込み失敗
      mm_status.errorNo = mm_error.SC_WRITE_FAILED;
      mm_status.failedCallback( mm_status );
    });
  }
  // freezeUser
  else if( mm_status.writeMethodId == mm_write_method_id.FREEZE_USER ){
    contract.methods.freezeUser( mm_status.targetAddress, mm_status.targetFlag ).send(txParam)
    .on('transactionHash', function(hash){
      mm_status.resultHash = hash;

      // 次へ
      callbackForNext();
    })
    .on('error', function(error, receipt){
      // エラー：書き込み失敗
      mm_status.errorNo = mm_error.SC_WRITE_FAILED;
      mm_status.failedCallback( mm_status );
    });
  }
}

