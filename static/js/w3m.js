//---------------------------------------------
// Web3Modal関連
//---------------------------------------------
let w3m_instance = null;
let w3m_provider = null;

//-------------------------
// [w3m] 有効性確認
//-------------------------
function w3m_isEnable(){
  if( w3m_instance != null ){
    return( true );
  }

  return( false );
}

//-------------------------
// [w3m] 初期化
//-------------------------
async function w3m_initialize() {
  if( w3m_isEnable() ){
    return( true );
  }

  // 初期化オプション
  const WalletConnectProvider = window.WalletConnectProvider.default;
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          137: "https://polygon-mainnet.infura.io/v3/bdfac3ceec6f481ab17433f4a8e92761",
          80001: "https://polygon-mumbai.infura.io/v3/bdfac3ceec6f481ab17433f4a8e92761"
        }
      }
    }
  };

  // 初期化
  try {
    const Web3Modal = window.Web3Modal.default;
    w3m_instance = new Web3Modal({
      cacheProvider: true,              // optional
      providerOptions,                  // required
      disableInjectedProvider: false,   // optional
    });
  } catch(e) {
    return( false );
  }

  return( w3m_isEnable() );
}

//-------------------------
// [w3m] 接続確認
//-------------------------
function w3m_isConnected(){
  if( w3m_provider != null ){
    return( true );
  }

  return( false );
}

//------------------------
// [w3m] web3 取得
//------------------------
function w3m_getWeb3(){
  if( w3m_isConnected() ){
    return( new Web3( w3m_provider ) );
  }

  return( null );
}

//-------------------------
// [w3m] 接続
//-------------------------
async function w3m_connect( _onAccountChanged=()=>{}, _onChainChanged=()=>{} ){
  // 無効は無視
  if( ! w3m_isEnable() ){
    return( false );
  }

  // 接続済みは無視
  if( w3m_isConnected() ){
    return( true );
  }

  try {
    w3m_provider = await w3m_instance.connect();
  } catch(e) {
    return( false );
  }

  // アカウトが切り替わった際のコールバックを登録
  w3m_provider.on( "accountsChanged", (accounts) => {
    _onAccountChanged( accounts );
  });

  // チェーンが切り替わった際のコールバックを登録(chainIdは16進数の文字列で渡される)
  w3m_provider.on( "chainChanged", (chainId) => {
    _onChainChanged( chainId );
  });

  return( w3m_isConnected() );
}

//-------------------------
// [w3m] 切断
//-------------------------
async function w3m_disconnect(){
  // 無効は無視
  if( ! w3m_isEnable() ){
    return( false );
  }

  // 未接続は無視
  if( ! w3m_isConnected() ){
    return( true );
  }

  if( w3m_provider.close ) {
    await w3m_provider.close();
  }
  await w3m_instance.clearCachedProvider();

  w3m_provider = null;
  return( ! w3m_isConnected() );
}

//-------------------------
// [w3m] キャッシュの削除
//-------------------------
async function w3m_clearCache(){
  // 無効は無視
  if( ! w3m_isEnable() ){
    return( false );
  }

  if( w3m_isConnected() ){
    if( w3m_provider.close ) {
      await w3m_provider.close();
    }
  }
  await w3m_instance.clearCachedProvider();

  w3m_provider = null;
  return( ! w3m_isConnected() );
}

