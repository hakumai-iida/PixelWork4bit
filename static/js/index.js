//-----------------------------------------------------------
// 文言
//-----------------------------------------------------------
const _mmMessageForInstall = '<img class="icon" src="img/metamaskx3.png"> MetaMaskを インストールするのダ！';
const _mmMessageForNetworkPolygon = '<img class="icon" src="img/metamaskx3.png"> Polygonチェーンに きりかえるのだ！';
const _mmMessageForNetworkMumbai = '<img class="icon" src="img/metamaskx3.png"> Mumbaiチェーンに きりかえるのだ！';
const _mmMessageForConnect = '<img class="icon" src="img/metamaskx3.png"> MetaMaskに セツゾクするのだ！';

const _mmResponseForInstall = [
  "ものはためしに インストールするのダ！",
  "そういわずに インストールするのダ！",
  "おねがいだから インストールするのダ！"
];

const _mmResponseForNetwork = [
  "Polygonのセッテイは したのヘルプをみるのダ！",
  "セッテイがスんだら きりかえるのダ！",
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

  mintBlock: null,
  mintMessage: null,
  mintConfirm: null,
  mintYes: null,
  mintNo: null,
  mintResponse: null,

　isBusy: false,
  connectRetryCount: 0,
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

  gC.mintBlock = document.getElementById('mint-block');
  gC.mintMessage = document.getElementById('mint-message');
  gC.mintConfirm = document.getElementById('mint-confirm');
  gC.mintYes = document.getElementById('mint-yes');
  gC.mintNo = document.getElementById('mint-no');
  gC.mintResponse = document.getElementById('mint-response');

  // イベント登録
  gC.mintFileInput.addEventListener( "change", (e)=>{ onMintFileInputChanged( e ); });
  gC.mintCanvas.addEventListener( "click", (e)=>{ onMintCanvasClicked( e ); });
  gC.galleryCanvas.addEventListener( "click", (e)=>{ onGalleryCanvasClicked( e ); });
  gC.mmYes.addEventListener( "click", (e)=>{ onMmYesClicked( e ); });
  gC.mmNo.addEventListener( "click", (e)=>{ onMmNoClicked( e ); });
  gC.mintYes.addEventListener( "click", (e)=>{ onMintYesClicked( e ); });
  gC.mintNo.addEventListener( "click", (e)=>{ onMintNoClicked( e ); });

  // キャンバスクリア
  clearMintCanvas();
  clearGalleryCanvas();

  // 接続先の選択
  gs_config_setForMainnet();
  //gs_config_setForDevelop();

  // リンク先の調整
  if( gs_config.FIXED_NETWORK_ID == 137 ){
    gC.linkOpenSea.href = "https://opensea.io/collection/pixel-work-4-bit";
  }else if( gs_config.FIXED_NETWORK_ID == 80001 ){
    gC.linkOpenSea.href = "https://testnets.opensea.io/collection/pixel-work-4-bit-ig53szylww";
  }

  // メタマスクの事前確認
  gC.connectRetryCount = 0;
  connectToMetamask();
});

//-------------------------
// メタマスクへの接続
//-------------------------
function connectToMetamask(){
  if( gC.isBusy ){ return; }
  gC.isBusy = true;

  gs_precheckMetaMask( (status)=>{
    gC.isBusy = false;
    onMetamaskConnected();
  },(status)=>{
    gC.isBusy = false;
    if( gC.connectRetryCount > 5 ){
      onMetamaskNotConnected();
    }else{
      gC.connectRetryCount++;
      setTimeout('connectToMetamask();', 100);
    }
  });  
}

//-------------------------
// 全て表示
//-------------------------
function showAll(){
  header.style.display = "block";
  main.style.display = "block";
  footer.style.display = "block";
}

//-------------------------
// メタマスクブロック表示
//-------------------------
function showMmBlock( flag ){
  if( flag ){
    gC.mmBlock.style.display = "block";
  }else{
    gC.mmBlock.style.display = "none";    
  }
}

//-------------------------
// ミントブロック表示
//-------------------------
function showMintBlock( flag ){
  if( flag ){
    gC.mintBlock.style.display = "block";
  }else{
    gC.mintBlock.style.display = "none";    
  }
}

//-------------------------
// メタマスク未接続
//-------------------------
function onMetamaskNotConnected(){
  showMintBlock( false );

  gC.mmErrorNo = gs_status.errorNo;
  if( gC.mmErrorNo == gs_error.METAMASK_NOT_FOUND ){
    gC.mmMessage.innerHTML = _mmMessageForInstall;
    gC.mmResponse.innerHTML = "";
  }else if( gC.mmErrorNo == gs_error.NETWORK_NOT_VALID ){
    if( gs_config.FIXED_NETWORK_ID == 137 ){
      gC.mmMessage.innerHTML = _mmMessageForNetworkPolygon;
    }else if( gs_config.FIXED_NETWORK_ID == 80001 ){
      gC.mmMessage.innerHTML = _mmMessageForNetworkMumbai;
    }
    gC.mmResponseNoForCancel = 0;
    gC.mmResponse.innerHTML = _mmResponseForNetwork[gC.mmResponseNoForCancel];
  }else{
    gC.mmMessage.innerHTML = _mmMessageForConnect;
    gC.mmResponse.innerHTML = "";
  }

  showMmBlock( true );
  showAll();
}

//-------------------------
// メタマスク接続済み
//-------------------------
function onMetamaskConnected(){
  showMmBlock( false );

  showMintBlock( true );
  showAll();
}

//-------------------------
// mint-canvas がクリックされた
//-------------------------
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
          console.log( "@ errorNo=" + errorNo );

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
          console.log( "@strArrPal.length = ", strArrPal.length );
          console.log( "@strArrDot.length = ", strArrDot.length );
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

//-------------------------
// gallery-canvas がクリックされた
//-------------------------
function onGalleryCanvasClicked( e ){
  if( gC.isBusy ){ return; }
  gC.isBusy = true;

  gs_read_totalToken( (status)=>{
    let target = 1 + parseInt( status.resultNum*Math.random());
    while( target == gC.galleryTokenId ){
      target = 1 + parseInt( status.resultNum*Math.random());
    }
    gC.galleryTokenId = target;

    gs_read_tokenImage( gC.galleryTokenId, (status)=>{
      gC.isBusy = false;
      pcDrawWithImageString( gC.galleryCanvas, status.resultImage );
      if( gs_config.FIXED_NETWORK_ID == 137 ){
        gC.galleryTokenInfo.innerHTML = '<a href="https:/opensea.io/assets/matic/0xF42dA926C5826FEb98bE9c12c3B2bC56b00411B0/' + gC.galleryTokenId + '" target="_blank">Pixel Work # ' + gC.galleryTokenId + '</a><br>';
      }else if( gs_config.FIXED_NETWORK_ID == 80001 ){
        gC.galleryTokenInfo.innerHTML = '<a href="https://testnets.opensea.io/assets/0x467Aae6B455ED4FA3eF584ADdbAcfc34cf4ED0eC/' + gC.galleryTokenId + '" target="_blank">Pixel Work # ' + gC.galleryTokenId + '</a><br>';
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
  if( gC.mmErrorNo == gs_error.METAMASK_NOT_FOUND ){
    window.open( "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" );
  }else{
    gs_checkMetaMaskAccount( (status)=>{
      onMetamaskConnected();
    },(status) =>{
      onMetamaskNotConnected();      
    });
  }
}

//-------------------------
// mm-no がクリックされた
//-------------------------
function onMmNoClicked( e ){
  if( gC.mmErrorNo == gs_error.METAMASK_NOT_FOUND ){
    gC.mmResponseNoForCancel++;
    if( gC.mmResponseNoForCancel >= _mmResponseForInstall.length ){
      gC.mmResponseNoForCancel = 0;
    }
    gC.mmResponse.innerHTML = _mmResponseForInstall[gC.mmResponseNoForCancel];
  }else if( gC.mmErrorNo == gs_error.NETWORK_NOT_VALID ){
    gC.mmResponseNoForCancel++;
    if( gC.mmResponseNoForCancel >= _mmResponseForNetwork.length ){
      gC.mmResponseNoForCancel = 0;
    }
    gC.mmResponse.innerHTML = _mmResponseForNetwork[gC.mmResponseNoForCancel];
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
  gs_write_mintToken( gC.mintStrPal, gC.mintStrDot, (status)=>{
    gC.isBusy = false;
    gC.mintMessage.innerHTML = _mintMessageForSuccess;    

    // 確認窓は消す
    gC.mintConfirm.style.display = "none";

    let hash = status.txHash;
    let url;
    if( gs_config.FIXED_NETWORK_ID == 137 ){
      url = "https://polygonscan.com/tx/" + hash;
    }else if( gs_config.FIXED_NETWORK_ID == 80001 ){
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

