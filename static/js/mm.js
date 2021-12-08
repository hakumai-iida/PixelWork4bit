//---------------------------------------------
// 定数：エラー番号
//---------------------------------------------
const gs_error = {
  SUCCESS: 0,               // 成功（※エラーなし）

  METAMASK_NOT_FOUND: 1,    // MetaMaskが見つからない（※ブラウザにインストールされていない）
  SITE_NOT_CONNECTED: 2,    // サイトに接続できていない（※MetaMaskへの接続が許可されていない）
  NETWORK_NOT_VALID: 3,     // ネットワークが不正（※[FIXED_NETWORK_ID]につないでいない）
  ACCOUNT_NOT_FOUND: 4,     // アカウントがみつからない
  SC_READ_FAILED: 5,        // スマートコントラクトの読み込み処理が失敗
  SC_WRITE_FAILED: 6,       // スマートコントラクトの書き込み処理が失敗

  UNKNOWN: 999              // この値が来たら何か変
};

//---------------------------------------------
// メソッドID
//---------------------------------------------
var gs_method_id = {
  // 読み込み
  READ_TOTAL_TOKEN: 0,              // 読み込み: totalToken()
  READ_TOTAL_CREATOR: 1,            // 読み込み: totalCreator()
  READ_TOKEN_BIRTHDAY: 2,           // 読み込み: tokenBirthday( tokenId )
  READ_TOKEN_CREATOR: 3,            // 読み込み: tokenCreator( tokenId )
  READ_TOKEN_IMAGE: 4,              // 読み込み: tokenImage( tokenId )
  READ_CREATOR_ID: 5,               // 読み込み: creatorId( creator )
  READ_CREATOR_ADDRESS: 6,          // 読み込み: creatorAddress( cId )
  READ_CREATOR_CREATED_NUM: 7,      // 読み込み: creatorCreatedNum( creator )
  READ_CREATOR_TOKEN_LIST: 8,       // 読み込み: creatorTokenList( creator, pageSize, pageOfs )
  READ_IS_TOKEN_FROZEN: 9,          // 読み込み: isTokenFrozen( tokenId )
  READ_IS_USER_FROZEN: 10,          // 読み込み: isUserFrozen( address )
  READ_TOKEN_URI: 11,               // 読み込み: tokenURI( tokenId )

  // 書き込み
  WRITE_MINT_TOKEN: 100,            // 書き込み: mintToken
  WRITE_FREEZE_TOKEN: 101,          // 書き込み: freezeToken
  WRITE_FREEZE_USER: 102,           // 書き込み: freezeUser

  UNKNOWN: 999
};

//---------------------------------------------
// コンフィグ
//---------------------------------------------
var gs_config = {
  FIXED_NETWORK_ID: 0,    // 接続対象のネットワークID
  CONTRACT_ADDRESS: "",   // スマートコントラクトアドレス
};

// 本番用の設定
function gs_config_setForMainnet(){
  gs_config.FIXED_NETWORK_ID = 137;
  gs_config.CONTRACT_ADDRESS = "0xF42dA926C5826FEb98bE9c12c3B2bC56b00411B0";
}

// 開発用の設定
function gs_config_setForDevelop(){
  gs_config.FIXED_NETWORK_ID = 80001;
  gs_config.CONTRACT_ADDRESS = "0x467Aae6B455ED4FA3eF584ADdbAcfc34cf4ED0eC";
}

//---------------------------------------------
// 広域パラメータ
//---------------------------------------------
// 状況
var gs_status = {
  errorNo: gs_error.UNKNOWN,
  failedCallback: null,
  methodId: gs_method_id.UNKNOWN,

  isMetaMaskEnable: false,
  currentNetworkId: 0,
  currentAccount: "",
  toAccount: "",

  targetId: 0,
  targetAddress: "",
  targetPal: "",
  targetDot: "",
  targetFlag: false,
  targetSize: 0,
  targetOfs: 0,

  txHash: "",
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
function gs_resetStatus(){
  gs_status.errorNo = gs_error.UNKNOWN,
  gs_status.failedCallback = null;
  gs_status.methodId = gs_method_id.UNKNOWN;

  gs_status.isMetaMaskEnable = false;
  gs_status.currentNetworkId = 0;
  gs_status.currentAccount = "";
  gs_status.toAccount = "";

  gs_status.targetId = 0;
  gs_status.targetAddress = "";
  gs_status.targetPal = "";
  gs_status.targetDot = "";
  gs_status.targetFlag = false;
  gs_status.targetSize = 0;
  gs_status.targetOfs = 0;

  gs_status.txHash = "";
  gs_status.resultId = 0;
  gs_status.resultNum = 0;
  gs_status.resultUri = "";
  gs_status.resultDate = 0;
  gs_status.resultAddress = "";
  gs_status.resultImage = "";
  gs_status.resultFlag = false;
  gs_status.resultList = [];
}

//----------------------------
// MetaMaskの事前確認
//----------------------------
// 窓口
function gs_precheckMetaMask( callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  _precheckMetaMask( () => {
    // 成功
    gs_status.errorNo = gs_error.SUCCESS;
    callback( gs_status );
  });
}

// 実体
function _precheckMetaMask( callbackForNext=()=>{} ){
  // MetaMaskが有効であれば
  if( window.ethereum && window.ethereum.isMetaMask ){
    if( window.ethereum.chainId == gs_config.FIXED_NETWORK_ID ){
      gs_status.currentNetworkId = window.ethereum.chainId;
      window.ethereum.request({method: 'eth_accounts'}).then(accounts => {
        if( accounts.length > 0 ){
          gs_status.currentAccount = accounts[0];

          // 次へ
          callbackForNext();
        } else {
          // エラー：アカウントが見つからない
          gs_status.errorNo = gs_error.ACCOUNT_NOT_FOUND;
          gs_status.failedCallback( gs_status );
        }
      });
    } else {
      // エラー：指定のネットワークに接続していない
      gs_status.errorNo = gs_error.NETWORK_NOT_VALID;
      gs_status.failedCallback( gs_status );
    }      
  }else{
    // エラー：MetaMaskが見つからない
    gs_status.errorNo = gs_error.METAMASK_NOT_FOUND;
    gs_status.failedCallback( gs_status );
  }
}

//----------------------------
// MetaMaskの有効性確認
//----------------------------
// 窓口
function gs_checkMetaMaskEnable( callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  _checkMetaMaskEnable( () => {
    // 成功
    gs_status.errorNo = gs_error.SUCCESS;
    callback( gs_status );
  });
}

// 実体
function _checkMetaMaskEnable( callbackForNext=()=>{} ){
  // MetaMaskが有効であれば
  if( window.ethereum && window.ethereum.isMetaMask ){
    // イーサリアムの有効化
    const promise = new Promise((resolve, reject) => {
      ethereumEnable().then( result =>{
        if( result ){
          resolve();
        }else{
          reject();
        }
      });
    });

    promise.then(
      // resolve
      () => {
        // 成功
        gs_status.errorNo = gs_error.SUCCESS;

        // 有効性の保持
        gs_status.isMetaMaskEnable = true;

        // 成功コールバックを呼ぶ
        callbackForNext();
      },
      // reject
      () => {
        // エラー：サイトに接続できなかった
        gs_status.errorNo = gs_error.SITE_NOT_CONNECTED;
        gs_status.failedCallback( gs_status );
      }
    );
  }else{
    // エラー：MetaMaskが見つからない
    gs_status.errorNo = gs_error.METAMASK_NOT_FOUND;
    gs_status.failedCallback( gs_status );
  }
}

// ethereumの有効化
async function ethereumEnable(){
    try{
      // これでMetaMaskとサイトが接続される(※window.ethereum.enable()は[deprecated])
      await ethereum.send('eth_requestAccounts');
    }catch( error ){
      return false;
    }

    return true;
}

//----------------------------
// ネットワークの確認
//----------------------------
// 窓口
function gs_checkMetaMaskNetworkId( callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  _checkMetaMaskEnable( () => {
    _checkMetaMaskNetworkId( () =>{
        // 成功
        gs_status.errorNo = gs_error.SUCCESS;
        callback( gs_status );
    });
  });
}

// 実体
function _checkMetaMaskNetworkId( callbackForNext=()=>{} ){
  // 接続先の保持
  gs_status.currentNetworkId = window.ethereum.chainId;

  // 固定ネットワークと一致した場合
  if( gs_status.currentNetworkId == gs_config.FIXED_NETWORK_ID ){
    // 成功
    gs_status.errorNo = gs_error.SUCCESS;

    // 成功コールバックを呼ぶ
    callbackForNext();
  } else {
    // エラー：指定のネットワークに接続していない
    gs_status.errorNo = gs_error.NETWORK_NOT_VALID;
    gs_status.failedCallback( gs_status );
  }
}

//----------------------------
// アカウントの確認
//----------------------------
// 窓口
function gs_checkMetaMaskAccount( callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  _checkMetaMaskEnable( () => {
    _checkMetaMaskNetworkId( () => {
      _checkMetaMaskAccount( () => {
        // 成功
        gs_status.errorNo = gs_error.SUCCESS;
        callback( gs_status );
      });
    });
  });
}

// 実体
function _checkMetaMaskAccount( callbackForNext=()=>{} ){
  window.ethereum.request({method: 'eth_accounts'}).then(accounts => {
    if( accounts.length > 0 ){
      gs_status.currentAccount = accounts[0];

      // 次へ
      callbackForNext();
    } else {
      // エラー：アカウントが見つからない
      gs_status.errorNo = gs_error.ACCOUNT_NOT_FOUND;
      gs_status.failedCallback( gs_status );
    }
  });
}

//----------------------------------------------------------
// 読み込み：窓口
//----------------------------------------------------------
// totalToken
function gs_read_totalToken( callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_TOTAL_TOKEN;

  _execRead( callback );
}

// totalCreator
function gs_read_totalCreator( callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_TOTAL_CREATOR;

  _execRead( callback );
}

// tokenBirthday( tokenId )
function gs_read_tokenBirthday( tokenId, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_TOKEN_BIRTHDAY;
  gs_status.targetId = tokenId;

  _execRead( callback );
}

// tokenCreator( tokenId )
function gs_read_tokenCreator( tokenId, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_TOKEN_CREATOR;
  gs_status.targetId = tokenId;

  _execRead( callback );
}

// tokenImage( tokenId )
function gs_read_tokenImage( tokenId, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_TOKEN_IMAGE;
  gs_status.targetId = tokenId;

  _execRead( callback );
}

// creatorId( creator )
function gs_read_creatorId( creator, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_CREATOR_ID;
  gs_status.targetAddress = creator;

  _execRead( callback );
}

// creatorAddress( cId )
function gs_read_creatorAddress( creatorId, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_CREATOR_ADDRESS;
  gs_status.targetId = creatorId;

  _execRead( callback );
}

// creatorCreatedNum( creator )
function gs_read_creatorCreatedNum( creator, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_CREATOR_CREATED_NUM;
  gs_status.targetAddress = creator;

  _execRead( callback );
}

// creatorTokenList( creator, pageSize, pageOfs )
function gs_read_creatorTokenList( creator, pageSize, pageOfs, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_CREATOR_TOKEN_LIST;
  gs_status.targetAddress = creator;
  gs_status.targetSize = pageSize;
  gs_status.targetOfs = pageOfs;

  _execRead( callback );
}

// isTokenFrozen
function gs_read_isTokenFrozen( id, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_IS_TOKEN_FROZEN;
  gs_status.targetId = id;

  _execRead( callback );
}

// isUserFrozen
function gs_read_isUserFrozen( address, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_IS_USER_FROZEN;
  gs_status.targetAddress = address;

  _execRead( callback );
}

// tokenURI
function gs_read_tokenURI( id, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.READ_TOKEN_URI;
  gs_status.targetId = id;

  _execRead( callback );
}

//----------------------------------------------------------
// 読み込み：処理実体
//----------------------------------------------------------
// 窓口
function _execRead( callback=()=>{} ){

  // MetaMaskが有効であれば
  if( window.ethereum && window.ethereum.isMetaMask ){
    // 接続先の保持
    gs_status.currentNetworkId = window.ethereum.chainId;

    // 固定ネットワークと一致した場合
    if( gs_status.currentNetworkId == gs_config.FIXED_NETWORK_ID ){
      _read( () => {
        gs_status.errorNo = gs_error.SUCCESS;
        callback( gs_status );
      });
    } else {
      // エラー：指定のネットワークに接続していない
      gs_status.errorNo = gs_error.NETWORK_NOT_VALID;
      gs_status.failedCallback( gs_status );
    }
  }else{
    // エラー：MetaMaskが見つからない
    gs_status.errorNo = gs_error.METAMASK_NOT_FOUND;
    gs_status.failedCallback( gs_status );
  }
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

  web3 = new Web3(window.ethereum);
  var contract = new web3.eth.Contract( abi, gs_config.CONTRACT_ADDRESS );

  // 読み込み処理の実行
  try{
    // totalToken
    if( gs_status.methodId == gs_method_id.READ_TOTAL_TOKEN ){
      gs_status.resultNum = await contract.methods.totalToken().call();
    }
    // totalCreator
    else if( gs_status.methodId == gs_method_id.READ_TOTAL_CREATOR ){
      gs_status.resultNum = await contract.methods.totalCreator().call();
    }
    // tokenBirthday
    else if( gs_status.methodId == gs_method_id.READ_TOKEN_BIRTHDAY ){
      gs_status.resultDate = await contract.methods.tokenBirthday( gs_status.targetId ).call();
    }
    // tokenCreator
    else if( gs_status.methodId == gs_method_id.READ_TOKEN_CREATOR ){
      gs_status.resultAddress = await contract.methods.tokenCreator( gs_status.targetId ).call();
    }
    // tokenImage
    else if( gs_status.methodId == gs_method_id.READ_TOKEN_IMAGE ){
      gs_status.resultImage = await contract.methods.tokenImage( gs_status.targetId ).call();
    }
    // creatorId
    else if( gs_status.methodId == gs_method_id.READ_CREATOR_ID ){
      gs_status.resultId = await contract.methods.creatorId( gs_status.targetAddress ).call();
    }
    // creatorAddress
    else if( gs_status.methodId == gs_method_id.READ_CREATOR_ADDRESS ){
      gs_status.resultAddress = await contract.methods.creatorAddress( gs_status.targetId ).call();
    }
    // creatorCreatedNum
    else if( gs_status.methodId == gs_method_id.READ_CREATOR_CREATED_NUM ){
      gs_status.resultNum = await contract.methods.creatorCreatedNum( gs_status.targetAddress ).call();
    }
    // creatorTokenList
    else if( gs_status.methodId == gs_method_id.READ_CREATOR_TOKEN_LIST ){
      gs_status.resultList = await contract.methods.creatorTokenList( gs_status.targetAddress, gs_status.targetSize, gs_status.targetOfs ).call();
    }
    // isTokenFrozen
    else if( gs_status.methodId == gs_method_id.READ_IS_TOKEN_FROZEN ){
      gs_status.resultFlag = await contract.methods.isTokenFrozen( gs_status.targetId ).call();
    }
    // isUserFrozen
    else if( gs_status.methodId == gs_method_id.READ_IS_USER_FROZEN ){
      gs_status.resultFlag = await contract.methods.isUserFrozen( gs_status.targetAddress ).call();
    }
    // tokenURI
    else if( gs_status.methodId == gs_method_id.READ_TOKEN_URI ){
      gs_status.resultUri = await contract.methods.tokenURI( gs_status.targetId ).call();
    }

    // 次へ
    callbackForNext();
  }catch(error){
    // エラー：読み込み失敗
    gs_status.errorNo = gs_error.SC_READ_FAILED;
    gs_status.failedCallback( gs_status );
  }
}

//----------------------------
// 書き込み：窓口
//----------------------------
// mintToken
function gs_write_mintToken( pal, dot, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.WRITE_MINT_TOKEN;
  gs_status.targetPal = pal;
  gs_status.targetDot = dot;

  _execWrite( callback );
}

// freezeToken
function gs_write_freezeToken( id, flag, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.WRITE_FREEZE_TOKEN;
  gs_status.targetId = id;
  gs_status.targetFlag = flag;

  _execWrite( callback );
}

// freezeUser
function gs_write_freezeUser( address, flag, callback=()=>{}, callbackForFailed=()=>{} ){
  gs_resetStatus();
  gs_status.failedCallback = callbackForFailed;

  gs_status.methodId = gs_method_id.WRITE_FREEZE_USER;
  gs_status.targetAddress = address;
  gs_status.targetFlag = flag;

  _execWrite( callback );
}

//----------------------------------------------------------
// 書き込み：処理実体
//----------------------------------------------------------
// 窓口
function _execWrite( callback=()=>{} ){

  _checkMetaMaskEnable( () => {
    _checkMetaMaskNetworkId( () => {
      _checkMetaMaskAccount( () => {
          _write( () => {
            gs_status.errorNo = gs_error.SUCCESS;
            callback( gs_status );
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

  web3 = new Web3(window.ethereum);
  var contract = new web3.eth.Contract( abi, gs_config.CONTRACT_ADDRESS );

  // トランザクションパラメータ
  const txParam = {
    from: gs_status.currentAccount,
  };

  // mintToken
  if( gs_status.methodId == gs_method_id.WRITE_MINT_TOKEN ){
    contract.methods.mintToken( gs_status.targetPal, gs_status.targetDot ).send(txParam)
    .on('transactionHash', function(txHash){
      gs_status.txHash = txHash;

      // 次へ
      callbackForNext();
    })
    .on('error', function(error, receipt){
      // エラー：書き込み失敗
      gs_status.errorNo = gs_error.SC_WRITE_FAILED;
      gs_status.failedCallback( gs_status );
    });
  }
  // freezeToken
  else if( gs_status.methodId == gs_method_id.WRITE_FREEZE_TOKEN ){
    contract.methods.freezeToken( gs_status.targetId, gs_status.targetFlag ).send(txParam)
    .on('transactionHash', function(txHash){
      gs_status.txHash = txHash;

      // 次へ
      callbackForNext();
    })
    .on('error', function(error, receipt){
      // エラー：書き込み失敗
      gs_status.errorNo = gs_error.SC_WRITE_FAILED;
      gs_status.failedCallback( gs_status );
    });
  }
  // freezeUser
  else if( gs_status.methodId == gs_method_id.WRITE_FREEZE_USER ){
    contract.methods.freezeUser( gs_status.targetAddress, gs_status.targetFlag ).send(txParam)
    .on('transactionHash', function(txHash){
      gs_status.txHash = txHash;

      // 次へ
      callbackForNext();
    })
    .on('error', function(error, receipt){
      // エラー：書き込み失敗
      gs_status.errorNo = gs_error.SC_WRITE_FAILED;
      gs_status.failedCallback( gs_status );
    });
  }
}

