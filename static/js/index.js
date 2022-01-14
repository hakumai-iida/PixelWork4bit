//-----------------------------------------------------------
// 文言
//-----------------------------------------------------------
const _mmMessageForConnect = '<img class="icon" src="img/metamaskx3.png"> ウォレットに セツゾクするのダ！';
const _mmMessageForChainPolygon = '<img class="icon" src="img/metamaskx3.png"> Polygonチェーンに きりかえるのダ！';
const _mmMessageForChainMumbai = '<img class="icon" src="img/metamaskx3.png"> Mumbaiチェーンに きりかえるのダ！';

const _mmResponseForInstall = [
  "ものはためしに インストールするのダ！",
  "そういわずに インストールするのダ！",
  "おねがいだから インストールするのダ！"
];

const _mmResponseForChain = [
  "Polygonのセッテイは したのヘルプを みるのダ！",
  "セッテイが スんだら きりかえるのダ！",
  "ものはためしに きりかえるのダ！",
  "そういわずに きりかえるのダ！",
  "おねがいだから きりかえるのダ！"
];

const _mmResponseForConnect = [
  "ものはためしに セツゾクするのダ！",
  "そういわずに セツゾクするのダ！",
  "おねがいだから セツゾクするのダ！"
];

const _mintMessageForSelect = "タップして ガゾウを センタクするのダ！";
const _mintMessageForMint = "このドットえを ミントするのダな？";
const _mintMessageForSuccess = "ソウシンに セイコウしたゾ！<br>したのハッシュで ケッカをかくにんするのダ！";
const _mintMessageForError = "ソウシンに シッパイしてしまったゾ...";

const _mintMessageForInvalidImage = "ガゾウのいろカズが 16ショクを こえておるゾ！";
const _mintResponseForInvalidImage = "べつのガゾウを センタクするのダ！";

//-----------------------------------------------------------
// 管理変数
//-----------------------------------------------------------
let gC = {
  header: null,
  main: null,
  footer: null,

  mintFileInput: null,
  workCanvas: null,
  mintCanvas: null,
  galleryCanvas: null,

  galleryTokenInfo: null,
  linkOpenSea: null,

  mmBlock: null,
  mmYes: null,
  mmNo: null, 
  mmMessage: null,

  connectedBlock: null,
  mintMessage: null,
  mintConfirm: null,
  mintYes: null,
  mintNo: null,
  mintResponse: null,

  logout: null,

　isBusy: false,
  galleryTokenId: 0,

  mmErrorNo: 0,
  mmResponseNoForCancel: 0,
  mintStrPal: "",
  mintStrDot: ""  
}

//-----------------------------------------------------------
// 読み込み完了時の処理
//-----------------------------------------------------------
window.addEventListener( "load", (e)=>{
  // 要素取り出し
  gC.header = document.getElementById('header'); 
  gC.main = document.getElementById('main'); 
  gC.footer = document.getElementById('footer'); 

  gC.mintFileInput = document.getElementById("mint-file-input");
  gC.workCanvas = document.getElementById("work-canvas");
  gC.mintCanvas = document.getElementById("mint-canvas");
  gC.galleryCanvas = document.getElementById("gallery-canvas");

  gC.galleryTokenInfo = document.getElementById("gallery-token-info");
  gC.linkOpenSea = document.getElementById("link-opensea");

  gC.mmBlock = document.getElementById('mm-block'); 
  gC.mmMessage = document.getElementById('mm-message');
  gC.mmYes = document.getElementById('mm-yes');
  gC.mmNo = document.getElementById('mm-no');
  gC.mmResponse = document.getElementById('mm-response');

  gC.connectedBlock = document.getElementById('connected-block');
  gC.mintMessage = document.getElementById('mint-message');
  gC.mintConfirm = document.getElementById('mint-confirm');
  gC.mintYes = document.getElementById('mint-yes');
  gC.mintNo = document.getElementById('mint-no');
  gC.mintResponse = document.getElementById('mint-response');

  gC.logout = document.getElementById( 'logout' );

  // イベント登録
  gC.mintFileInput.addEventListener( "change", (e)=>{ onMintFileInputChanged( e ); });
  gC.mintCanvas.addEventListener( "click", (e)=>{ onMintCanvasClicked( e ); });
  gC.galleryCanvas.addEventListener( "click", (e)=>{ onGalleryCanvasClicked( e ); });
  gC.mmYes.addEventListener( "click", (e)=>{ onMmYesClicked( e ); });
  gC.mmNo.addEventListener( "click", (e)=>{ onMmNoClicked( e ); });
  gC.mintYes.addEventListener( "click", (e)=>{ onMintYesClicked( e ); });
  gC.mintNo.addEventListener( "click", (e)=>{ onMintNoClicked( e ); });
  gC.logout.addEventListener( "click", (e)=>{ onLogOutClicked( e ); });

  // 接続先の選択
  w3m_initialize();

  // マネージャ初期化
  mm_config_initialize( w3m_getWeb3, mm_chain.POLYGON );
  //mm_config_initialize( w3m_getWeb3, mm_chain.MUMBAI );

  // 接続導線
  gC.mmMessage.innerHTML = _mmMessageForConnect;
  gC.mmResponse.innerHTML = "";
  showBlock( false );
});

//---------------------------------------
// 接続
//---------------------------------------
async function connectWallet(){
  await w3m_connect( (accounts)=>{
    updateBlockWallet();
  },(chainId)=>{
    updateBlockWallet();
  });
  updateBlockWallet();
}

//---------------------------------------
// 切断
//---------------------------------------
async function disconnectWallet(){
    await w3m_disconnect();
    updateBlockWallet();
}

//---------------------------------------
// 表示の切り替え
//---------------------------------------
function updateBlockWallet(){
  // 接続中
  if( w3m_isConnected() ){
    mm_checkConnectedAccount( (status)=>{
      showBlock( true );
    },(status) =>{
      gC.mmErrorNo = mm_status.errorNo;
      if( gC.mmErrorNo == mm_error.CHAIN_ID_NOT_VALID ){
        if( mm_config.TARGET_CHAIN_ID == 137 ){
          gC.mmMessage.innerHTML = _mmMessageForChainPolygon;
        }else if( mm_config.TARGET_CHAIN_ID == 80001 ){
          gC.mmMessage.innerHTML = _mmMessageForChainMumbai;
        }
        gC.mmResponseNoForCancel = 0;
        gC.mmResponse.innerHTML = _mmResponseForChain[gC.mmResponseNoForCancel];
        showBlock( false );
      }else{
        disconnectWallet();
      }
    });
  }
  // 未接続
  else{
    gC.mmMessage.innerHTML = _mmMessageForConnect;
    gC.mmResponse.innerHTML = "";
    showBlock( false );
  }
}

//-------------------------
// ブロック表示
//-------------------------
function showBlock( flag ){
  // キャンバスクリア
  clearMintCanvas();
  clearGalleryCanvas();

  // リンク先の調整
  if( mm_config.TARGET_CHAIN_ID == 137 ){
    gC.linkOpenSea.href = "https://opensea.io/collection/pixel-work-4-bit";
  }else if( mm_config.TARGET_CHAIN_ID == 80001 ){
    gC.linkOpenSea.href = "https://testnets.opensea.io/collection/pixel-work-4-bit-ig53szylww";
  }

  if( flag ){
    gC.mmBlock.style.display = "none";
    gC.connectedBlock.style.display = "block";
  }else{
    gC.mmBlock.style.display = "block";    
    gC.connectedBlock.style.display = "none";
  }

  header.style.display = "block";
  main.style.display = "block";
  footer.style.display = "block";
}

//---------------------------------
// mint-canvas がクリックされた
//---------------------------------
function onMintCanvasClicked( e ){
  gC.mintFileInput.value = null;
  gC.mintFileInput.click();
}

//-------------------------
// ファイルが選択された
//-------------------------
function onMintFileInputChanged( e ){
  let files = gC.mintFileInput.files;

  // 選択が有効
  if( files != null && files.length > 0 ){
    pcResetWork();

    let reader = new FileReader();
    reader.onload = ()=>{
        pcReadPixelData( gC.workCanvas, reader.result, (errorNo, strArrPal, strArrDot)=>{
          // パレットデータ
          let strPal = "";
          for( let i=0; i<strArrPal.length; i++ ){
              strPal += strArrPal[i];
          }
          while( strPal.length < 96 ){
              strPal += "0";
          }
          gC.mintStrPal = strPal;

          // ドットデータ
          let strDot = "";
          for( let i=0; i<strArrDot.length; i++ ){
              strDot += strArrDot[i];
          }
          gC.mintStrDot = strDot;

          // 表示の更新
          pcDrawWithPalAndDotString( gC.mintCanvas, strArrPal, strArrDot );

          if( errorNo == 0 ){
            // 確認窓の表示
            gC.mintMessage.innerHTML = _mintMessageForMint;
            gC.mintConfirm.style.display = "block";
            gC.mintResponse.innerHTML = "";
          }else{
            gC.mintMessage.innerHTML = _mintMessageForInvalidImage;
            gC.mintResponse.innerHTML = _mintResponseForInvalidImage;
          }
        } );
    }

    reader.readAsDataURL( files[0] );
  }
}

//---------------------------------
// gallery-canvas がクリックされた
//---------------------------------
function onGalleryCanvasClicked( e ){
  if( gC.isBusy ){ return; }
  gC.isBusy = true;

  mm_read_totalToken( (status)=>{
    let target = 1 + parseInt( status.resultNum*Math.random());
    while( target == gC.galleryTokenId ){
      target = 1 + parseInt( status.resultNum*Math.random());
    }
    gC.galleryTokenId = target;

    mm_read_tokenImage( gC.galleryTokenId, (status)=>{
      gC.isBusy = false;
      pcDrawWithImageString( gC.galleryCanvas, status.resultImage );
      if( mm_config.TARGET_CHAIN_ID == 137 ){
        gC.galleryTokenInfo.innerHTML = '<a href="https://opensea.io/assets/matic/0xF42dA926C5826FEb98bE9c12c3B2bC56b00411B0/' + gC.galleryTokenId + '" target="_blank">Pixel Work # ' + gC.galleryTokenId + '</a><br>';
      }else if( mm_config.TARGET_CHAIN_ID == 80001 ){
        gC.galleryTokenInfo.innerHTML = '<a href="https://testnets.opensea.io/assets/mumbai/0x467Aae6B455ED4FA3eF584ADdbAcfc34cf4ED0eC/' + gC.galleryTokenId + '" target="_blank">Pixel Work # ' + gC.galleryTokenId + '</a><br>';
      }
    },(status)=>{
      gC.isBusy = false;
    });

  },(status)=>{
    gC.isBusy = false;
  });
}

//-------------------------
// mm-yes がクリックされた
//-------------------------
function onMmYesClicked( e ){
  connectWallet();
}

//-------------------------
// mm-no がクリックされた
//-------------------------
function onMmNoClicked( e ){
  if( gC.mmErrorNo == mm_error.WEB3_NOT_ENABLE ){
    gC.mmResponseNoForCancel++;
    if( gC.mmResponseNoForCancel >= _mmResponseForInstall.length ){
      gC.mmResponseNoForCancel = 0;
    }
    gC.mmResponse.innerHTML = _mmResponseForInstall[gC.mmResponseNoForCancel];
  }else if( gC.mmErrorNo == mm_error.CHAIN_ID_NOT_VALID ){
    gC.mmResponseNoForCancel++;
    if( gC.mmResponseNoForCancel >= _mmResponseForChain.length ){
      gC.mmResponseNoForCancel = 0;
    }
    gC.mmResponse.innerHTML = _mmResponseForChain[gC.mmResponseNoForCancel];
  }else{
    gC.mmResponseNoForCancel++;
    if( gC.mmResponseNoForCancel >= _mmResponseForConnect.length ){
      gC.mmResponseNoForCancel = 0;
    }
    gC.mmResponse.innerHTML = _mmResponseForConnect[gC.mmResponseNoForCancel];
  }
}

//-------------------------
// mint-yes がクリックされた
//-------------------------
function onMintYesClicked( e ){  
  if( gC.mintStrPal.length != 96 ){
    gC.mintResponse.innerHTML = "パレットデータが　コワれておるゾ！";
    return;
  }

  if( gC.mintStrDot.length != 256 ){
    gC.mintResponse.innerHTML = "ドットデータが　コワれておるゾ！";
    return;
  }

  if( gC.isBusy ){
    gC.mintResponse.innerHTML = "ソウシンしょりが まだおわっておらぬゾ！";
    return;
  }
  gC.isBusy = true;

  gC.mintResponse.innerHTML = "トランザクションを ソウシンするゾ！";
  mm_write_mintToken( gC.mintStrPal, gC.mintStrDot, (status)=>{
    gC.isBusy = false;
    gC.mintMessage.innerHTML = _mintMessageForSuccess;    

    // 確認窓は消す
    gC.mintConfirm.style.display = "none";

    let hash = status.resultHash;
    let url;
    if( mm_config.TARGET_CHAIN_ID == 137 ){
      url = "https://polygonscan.com/tx/" + hash;
    }else if( mm_config.TARGET_CHAIN_ID == 80001 ){
      url = "https://mumbai.polygonscan.com/tx/" + hash;
    }
    let shortHash = hash.substr(0, 15) + "..." + hash.substr( hash.length-14 );
    gC.mintResponse.innerHTML = '<span class="large"><a href="' + url + '" target="_blank">' + '【' + shortHash + '】</a></span>';
  },(status)=>{
    gC.isBusy = false;
    gC.mintResponse.innerHTML = "ソウシンに シッパイして しまったゾ！";
  });
}

//-------------------------
// mint-no がクリックされた
//-------------------------
function onMintNoClicked( e ){
  clearMintCanvas();
}

//-------------------------
// logout がクリックされた
//-------------------------
function onLogOutClicked( e ){
  disconnectWallet();
}

//-------------------------
// mintキャンバスクリア
//-------------------------
function clearMintCanvas(){
  gC.mintMessage.innerHTML = _mintMessageForSelect;
  gC.mintConfirm.style.display = "none";
  gC.mintResponse.innerHTML = "";

  gC.mintStrPal = "";
  gC.mintStrDot = "" ; 

  pcResetWork();
  pcDrawWithPalAndDotString( gC.mintCanvas, null, null );
}

//-------------------------
// galleryキャンバスクリア
//-------------------------
function clearGalleryCanvas(){
  pcDrawWithImageString( gC.galleryCanvas, null );
}

