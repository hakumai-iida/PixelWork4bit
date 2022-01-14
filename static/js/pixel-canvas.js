//-------------------------------------
// 画素抽出キャンバス
//-------------------------------------
//---------------------
// ワーク
//---------------------
let _pcWork = {
    // ワーク
    pixelStage: null,
    pixelBitmap: null,

    // データ
    arrPal: [],
    arrDot: []
};

//---------------------------------------
// [pixel-canvas] ワークのリセット
//---------------------------------------
function pcResetWork(){
	if( _pcWork.pixelStage != null ){
		_pcWork.pixelStage.removeChild( _pcWork.pixelBitmap );
	    _pcWork.pixelStage.update();

		_pcWork.pixelStage = null;
		_pcWork.pixelBitmap = null;
	}

    _pcWork.arrPal = [];
    _pcWork.arrDot = [];
}

//---------------------------------------
// [pixel-canvas] ピクセルデータの読み込み
//---------------------------------------
function pcReadPixelData( workCanvas, imageSrc, callback ){
    // [onload]で画像の読み込みを待って処理する
    let image = new Image();
    image.onload = function(){
	    // 作業場所としてのCanvasを作成
    	let canvas = document.createElement( "canvas" );
	    canvas.width = 16;
	    canvas.height = 16;

	    // 読み込んだ画像の表示（用心に白を下地にしておく）
	    let ctx = canvas.getContext( "2d" );
      ctx.imageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
	    ctx.fillStyle = "#ffffff";
		  ctx.fillRect( 0, 0, 16, 16 );
	    ctx.drawImage( image, 0, 0, 16, 16 );

	    // [onload]で画像の読み込みを待ってから画素の抽出
	    let fixedImage = new Image();
	    fixedImage.onload = function(){
			  _pcWork.pixelBitmap = new createjs.Bitmap( fixedImage );

		    _pcWork.pixelStage = new createjs.Stage( workCanvas );
		    _pcWork.pixelStage.addChild( _pcWork.pixelBitmap );
		    _pcWork.pixelStage.update();

		    // 画素の抽出
        let result = _pcExtractPixel( workCanvas );
        callback( result, _pcWork.arrPal, _pcWork.arrDot );
	    }

	    // 描画した画像の読み込み
	    fixedImage.src = canvas.toDataURL();
    }

    // 画像の読み込み
    image.src = imageSrc;
}

//---------------------------------------
// [pixel-canvas] 画素の抽出
//---------------------------------------
function _pcExtractPixel( workCanvas ){
  let errorNo = 0;
  let canvas = workCanvas;
  let ctx = canvas.getContext( "2d" );
  let pixels = ctx.getImageData( 0, 0, 16, 16 );

	for( let i=0; i<16; i++ ){
    for( let j=0; j<16; j++ ){
      let at = 4*(16*i + j);

      let r = pixels.data[at+0].toString(16);
      let g = pixels.data[at+1].toString(16);
      let b = pixels.data[at+2].toString(16);
      if( r.length < 2 ){ r = "0" + r; }
      if( g.length < 2 ){ g = "0" + g; }
      if( b.length < 2 ){ b = "0" + b; }

      let strRGB = r + g + b;

      let palAt = -1;
      for( let k=0; k<_pcWork.arrPal.length; k++ ){
      	if( strRGB == _pcWork.arrPal[k] ){
      		palAt = k;
      		break;
      	}
      }

      if( palAt < 0 ){
      	palAt = _pcWork.arrPal.length;
      	if( palAt >= 16 ){
      		errorNo = 100;
          palAt = 15;
      	}else{
        	_pcWork.arrPal.push( strRGB );
        }
      }

      _pcWork.arrDot.push( palAt.toString(16) );
    }
	}

  return( errorNo );
}

//---------------------------------------
// [pixel-canvas] mainキャンバス更新
//---------------------------------------
function pcDrawWithPalAndDotString( canvas, arrStrPal, arrStrDot ){
	var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#111111";
    ctx.fillRect( 0, 0, 307, 307);

    if( arrStrPal == null || arrStrPal.length > 16 || arrStrDot == null || arrStrDot.length != 256 ){
        _pcDrawTAP( ctx );
        return;
    }

    for( let i=0; i<16; i++ ){
	    for( let j=0; j<16; j++ ){
	    	let palAt = parseInt( arrStrDot[16*i + j], 16 );
  		  ctx.fillStyle = "#" + arrStrPal[palAt];
      	ctx.fillRect( 2+19*j, 2+19*i, 18, 18 );
    	}    	
    }
}

//---------------------------------------
// [pixel-canvas] イメージ文字列で描画
//---------------------------------------
function pcDrawWithImageString( canvas, strImg ){
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "#111111";
  ctx.fillRect( 0, 0, 307, 307);

  if( strImg == null || strImg.length != 1536 ){
      _pcDrawTAP( ctx );
      return;
  }

  for( let i=0; i<16; i++ ){
    for( let j=0; j<16; j++ ){
      let dotAt = 16*i + j;
      ctx.fillStyle = "#" + strImg.substring( 6*dotAt, 6*(dotAt+1) );
      ctx.fillRect( 2+19*j, 2+19*i, 18, 18 );
    }       
  }
}

//--------------
// [TAP!]描画
//--------------
function _pcDrawTAP( ctx ){
  ctx.fillStyle = "#ccccff";
  let ofsX = 11;
  let ofsY = 11;

  // T
  ctx.fillRect( ofsX+19*1, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*2, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*3, ofsY+19*5, 18, 18 );

  ctx.fillRect( ofsX+19*2, ofsY+19*6, 18, 18 );
  ctx.fillRect( ofsX+19*2, ofsY+19*7, 18, 18 );
  ctx.fillRect( ofsX+19*2, ofsY+19*8, 18, 18 );
  ctx.fillRect( ofsX+19*2, ofsY+19*9, 18, 18 );

  // T
  ctx.fillRect( ofsX+19*5, ofsY+19*6, 18, 18 );
  ctx.fillRect( ofsX+19*5, ofsY+19*7, 18, 18 );
  ctx.fillRect( ofsX+19*5, ofsY+19*8, 18, 18 );
  ctx.fillRect( ofsX+19*5, ofsY+19*9, 18, 18 );

  ctx.fillRect( ofsX+19*6, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*6, ofsY+19*7, 18, 18 );

  ctx.fillRect( ofsX+19*7, ofsY+19*6, 18, 18 );
  ctx.fillRect( ofsX+19*7, ofsY+19*7, 18, 18 );
  ctx.fillRect( ofsX+19*7, ofsY+19*8, 18, 18 );
  ctx.fillRect( ofsX+19*7, ofsY+19*9, 18, 18 );

  // P
  ctx.fillRect( ofsX+19*9, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*9, ofsY+19*6, 18, 18 );
  ctx.fillRect( ofsX+19*9, ofsY+19*7, 18, 18 );
  ctx.fillRect( ofsX+19*9, ofsY+19*8, 18, 18 );
  ctx.fillRect( ofsX+19*9, ofsY+19*9, 18, 18 );

  ctx.fillRect( ofsX+19*10, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*10, ofsY+19*7, 18, 18 );

  ctx.fillRect( ofsX+19*11, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*11, ofsY+19*6, 18, 18 );
  ctx.fillRect( ofsX+19*11, ofsY+19*7, 18, 18 );

  // !
  ctx.fillRect( ofsX+19*13, ofsY+19*5, 18, 18 );
  ctx.fillRect( ofsX+19*13, ofsY+19*6, 18, 18 );
  ctx.fillRect( ofsX+19*13, ofsY+19*7, 18, 18 );

  ctx.fillRect( ofsX+19*13, ofsY+19*9, 18, 18 );
}
