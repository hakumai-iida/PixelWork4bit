// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./Lib/LibStr.sol";
import "./Lib/LibB64.sol";

//-----------------------------------
// トークン
//-----------------------------------
contract Token is Ownable, ERC721 {
    //-----------------------------------------
    // 定数
    //-----------------------------------------
    string constant private TOKEN_NAME = "Pixel Work 4-bit";
    string constant private TOKEN_SYMBOL = "PW4b";
    uint256 constant private TOKEN_ID_OFS = 1;
    uint256 constant private CREATOR_ID_OFS = 1;
    uint256 constant private COL_IN_PAL = 16;
    uint256 constant private COL_STR_LEN = 6;
    uint256 constant private PAL_STR_LEN = COL_IN_PAL*COL_STR_LEN;
    uint256 constant private DOT_WIDTH = 16;
    uint256 constant private DOT_HEIGHT = 16;
    uint256 constant private DOT_STR_LEN = DOT_WIDTH*DOT_HEIGHT;
    string[] private _strArrX = ["42","61","80","99","118","137","156","175","194","213","232","251","270","289","308","327"];
    string[] private _strArrY = ["20","39","58","77","96","115","134","153","172","191","210","229","248","267","286","305"];

    //-----------------------------------------
    // ストレージ
    //-----------------------------------------
    // token
    uint256[] private _arrBirthday;
    address[] private _arrCreator;
    bytes[COL_IN_PAL][] private _arrPal;
    bytes[] private _arrDot;
    bytes[] private _arrPalCount;

    // creator
    address[] private _arrCreatorForId;
    mapping( address => uint256) private _mapCreatorId;
    mapping( address => uint256[] ) private _mapCreatorTokens;

    //-----------------------------------------
    // 管理用
    //-----------------------------------------
    mapping( uint256 => bool ) private _mapFrozenToken;
    mapping( address => bool ) private _mapFrozenUser;

    //-----------------------------------------
    // コンストラクタ
    //-----------------------------------------
    constructor() Ownable() ERC721( TOKEN_NAME, TOKEN_SYMBOL ) {
    }

    //-----------------------------------------
    // [external] トークン数
    //-----------------------------------------
    function totalToken() external view returns (uint256) {
        return( _arrBirthday.length );
    }

    //-----------------------------------------
    // [external] クリエイター数
    //-----------------------------------------
    function totalCreator() external view returns (uint256) {
        return( _arrCreatorForId.length );
    }

    //-----------------------------------------
    // [external] 作成日時の取得
    //-----------------------------------------
    function tokenBirthday( uint256 tokenId ) external view returns (uint256) {
        require( _exists( tokenId ), "nonexistent token" );

        return( _arrBirthday[tokenId-TOKEN_ID_OFS] );
    }

    //-----------------------------------------
    // [external] クリエイターの取得
    //-----------------------------------------
    function tokenCreator( uint256 tokenId ) external view returns (address) {
        require( _exists( tokenId ), "nonexistent token" );

        return( _arrCreator[tokenId-TOKEN_ID_OFS] );
    }

    //-----------------------------------------
    // [external] 画像データの取得
    //-----------------------------------------
    function tokenImage( uint256 tokenId ) external view returns (string memory) {
        require( _exists( tokenId ), "nonexistent token" );

        bytes memory arrDot = _arrDot[tokenId-TOKEN_ID_OFS];
        bytes[COL_IN_PAL] memory arrPal = _arrPal[tokenId-TOKEN_ID_OFS];

        bytes[DOT_HEIGHT] memory bytesLines;
        for( uint256 y=0; y<DOT_HEIGHT; y++ ){
            bytesLines[y] = abi.encodePacked( arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+0]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+1]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+2]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+3]))] );
            bytesLines[y] = abi.encodePacked( bytesLines[y], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+4]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+5]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+6]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+7]))] );
            bytesLines[y] = abi.encodePacked( bytesLines[y], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+8]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+9]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+10]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+11]))] );
            bytesLines[y] = abi.encodePacked( bytesLines[y], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+12]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+13]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+14]))], arrPal[uint256(uint8(arrDot[DOT_WIDTH*y+15]))] );
        }

        bytesLines[0] = abi.encodePacked( bytesLines[0], bytesLines[1], bytesLines[2], bytesLines[3] );
        bytesLines[4] = abi.encodePacked( bytesLines[4], bytesLines[5], bytesLines[6], bytesLines[7] );
        bytesLines[8] = abi.encodePacked( bytesLines[8], bytesLines[9], bytesLines[10], bytesLines[11] );
        bytesLines[12] = abi.encodePacked( bytesLines[12], bytesLines[13], bytesLines[14], bytesLines[15] );

        return( string( abi.encodePacked( bytesLines[0], bytesLines[4], bytesLines[8], bytesLines[12] ) ) );
    }

    //-----------------------------------------
    // [external] クリエイターのIDの取得
    //-----------------------------------------
    function creatorId( address creator ) external view returns (uint256) {
        require( creator != address(0), "invalid address" );

        return( _mapCreatorId[creator] );
    }

    //-----------------------------------------
    // [external] クリエイターアドドレスの取得
    //-----------------------------------------
    function creatorAddress( uint256 cId ) external view returns (address) {
        require( cId >= CREATOR_ID_OFS && cId < (_arrCreatorForId.length+CREATOR_ID_OFS), "nonexistent creator" );

        return( _arrCreatorForId[cId-CREATOR_ID_OFS] );
    }

    //-----------------------------------------
    // [external] クリエイターの作成したトークン数
    //-----------------------------------------
    function creatorCreatedNum( address creator ) external view returns (uint256) {
        require( creator != address(0), "invalid address" );

        return( _mapCreatorTokens[creator].length );
    }

    //-----------------------------------------
    // [external] クリエイターの作成したトークン一覧
    //-----------------------------------------
    function creatorTokenList( address creator, uint256 pageSize, uint256 pageOfs ) external view returns (uint256[] memory) {
        require( creator != address(0), "invalid address" );

        uint256 size = _mapCreatorTokens[creator].length;
        uint256 startAt = pageOfs * pageSize;
        if( size < (startAt + pageSize) ){
            if( size <= startAt ){
                pageSize = 0;
            }else{
                pageSize = size - startAt;
            }
        }

        uint256[] memory list = new uint256[](pageSize);

        // 新しく作成したトークンから抽出
        for( uint256 i=0; i<pageSize; i++ ){
            list[i] = _mapCreatorTokens[creator][size-(startAt+i+1)];
        }

        return( list );
    }

    //-----------------------------------------
    // [public] 凍結されたトークンか？
    //-----------------------------------------
    function isTokenFrozen( uint256 tokenId ) public view returns (bool) {
        require( _exists( tokenId ), "nonexistent token" );

        return( _mapFrozenToken[tokenId] );
    }

    //-----------------------------------------
    // [external/onlyOwner] トークンの凍結
    //-----------------------------------------
    function freezeToken( uint256 tokenId, bool flag ) external onlyOwner {
        require( _exists( tokenId ), "nonexistent token" );

        if( flag ){
            _mapFrozenToken[tokenId] = true;
        }else{
            delete _mapFrozenToken[tokenId];
        }
    }

    //-----------------------------------------
    // [public] 凍結されたユーザーか？
    //-----------------------------------------
    function isUserFrozen( address user ) public view returns (bool) {
        require( user != address(0), "invalid address" );

        return( _mapFrozenUser[user] );
    }

    //-----------------------------------------
    // [external/onlyOwner] ユーザーの凍結
    //-----------------------------------------
    function freezeUser( address user, bool flag ) external onlyOwner {
        require( user != address(0), "invalid address" );

        if( flag ){
            _mapFrozenUser[user] = true;
        }else{
            delete _mapFrozenUser[user];
        }
    }

    //-----------------------------------------
    // [external] トークンの発行
    //-----------------------------------------
    function mintToken( string calldata palStr, string calldata dotStr ) external {
        // 凍結されているか？
        require( ! isUserFrozen( msg.sender ), "not available" );

        // パレットは有効か？
        bytes memory arrPal = bytes(palStr);
        require( arrPal.length == PAL_STR_LEN, "palStr: invalid length" );

        for( uint256 i=0; i<PAL_STR_LEN; i++ ){
            uint256 c = uint256(uint8(arrPal[i]));
            if( c >= 48 && c <= 57 ){ continue; }
            if( c >= 65 && c <= 70 ){ continue; }
            if( c >= 97 && c <= 102 ){ continue; }
            require( false, "palStr: invalid char" );
        }

        // 利用数の枠
        bytes memory counts = new bytes(COL_IN_PAL);

        // ドットは有効か？
        bytes memory arrDot = bytes(dotStr);
        require( arrDot.length == DOT_STR_LEN, "dotStr: invalid length" );

        for( uint256 i=0; i<DOT_STR_LEN; i++ ){
            uint256 c = uint256(uint8(arrDot[i]));
            if( c >= 48 && c <= 57 ){ c -= 48; }
            else if( c >= 65 && c <= 70 ){ c -= 55; }
            else if( c >= 97 && c <= 102 ){ c -= 87; }
            else{ require( false, "dotStr: invalid char" ); }

            arrDot[i] = bytes1(uint8(c));
            counts[c] = bytes1(uint8(uint256(uint8(counts[c]))+1));
        }
        
        //--------------------------
        // ここまできたらチェック完了
        //--------------------------

        // 発行
        uint256 tokenId = TOKEN_ID_OFS + _arrBirthday.length;
        _safeMint( msg.sender, tokenId );

        // トークン情報
        _arrBirthday.push( block.timestamp );
        _arrCreator.push( msg.sender );
        bytes[COL_IN_PAL] memory pal;
        for( uint256 i=0; i<COL_IN_PAL; i++ ){
            pal[i] = new bytes(COL_STR_LEN);
            for( uint256 j=0; j<COL_STR_LEN; j++ ){
                pal[i][j] = arrPal[COL_STR_LEN*i+j];
            }
        }
        _arrPal.push( pal );
        _arrDot.push( arrDot );
        _arrPalCount.push( counts );

        // クリエイター情報
        uint256 cId = _mapCreatorId[msg.sender];
        if( cId < CREATOR_ID_OFS ){
            cId = CREATOR_ID_OFS + _arrCreatorForId.length;
            _arrCreatorForId.push( msg.sender );
            _mapCreatorId[msg.sender] = cId;
        }

        _mapCreatorTokens[msg.sender].push( tokenId );
    }

    //-----------------------------------------
    // [public] トークンURI
    //-----------------------------------------
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require( _exists(tokenId), "nonexistent token" );

        // 凍結されているか？
        if( isTokenFrozen( tokenId ) ){
            return( string( _createFrozenMetadata( tokenId ) ) );
        }

        // メタデータを返す
        bytes memory bytesMeta = _createMetadata( tokenId );
        bytes memory bytesSvgHeader = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style> .fn{ font-family: serif; font-size:15px; fill:#eee;} .fc{ font-family: serif; font-size:24px; fill:#eee;}</style><rect x="0" y="0" width="350" height="350" fill="#333" />';
        bytes memory bytesSvgPal = _createSvgPal( tokenId );
        bytes memory bytesSvgDot = _createSvgDot( tokenId );
        bytes memory bytesSvgHooter = _createSvgFooter( tokenId );
        bytes memory bytesSvg = abi.encodePacked( bytesSvgHeader, bytesSvgPal, bytesSvgDot, bytesSvgHooter );

        // polygon/mumbai だと下記はダメ
        //return( string( abi.encodePacked( 'data:application/json;charset=UTF-8,{', bytesMeta, '"image": "data:image/svg+xml;base64,', LibB64.encode( bytesSvg ), '"}' ) ) );

        bytesMeta = abi.encodePacked( '{', bytesMeta, '"image": "data:image/svg+xml;base64,', LibB64.encode( bytesSvg ), '"}' );
        return( string( abi.encodePacked( 'data:application/json;base64,', LibB64.encode( bytesMeta ) ) ) );
    }

    //--------------------------------------
    // [internal] 凍結されたmetadataの作成
    //--------------------------------------
    function _createFrozenMetadata( uint256 tokenId ) internal pure returns( bytes memory ){        
        bytes memory bytesName = abi.encodePacked( '"name":"', TOKEN_SYMBOL, ' #', LibStr.numToStr( tokenId ), '",' );
        bytes memory bytesDescription = abi.encodePacked( '"description":"not available",' );
        bytes memory bytesSvg = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style> .f{ font-family: serif; font-size:200px; fill:#eee;}</style><rect x="0" y="0" width="350" height="350" fill="#333" /><text x="175" y="250" text-anchor="middle" class="f">?</text></svg>';

        // polygon/mumbai だと下記はダメ
        //return( abi.encodePacked( 'data:application/json;charset=UTF-8,{', bytesName, bytesDescription, '"image": "data:image/svg+xml;base64,', LibB64.encode( bytesSvg ), '"}' ) );

        bytes memory bytesMeta = abi.encodePacked( '{', bytesName, bytesDescription, '"image": "data:image/svg+xml;base64,', LibB64.encode( bytesSvg ), '"}' );
        return( abi.encodePacked( 'data:application/json;base64,', LibB64.encode( bytesMeta ) ) );
    }

    //--------------------------------------
    // [internal] metadataの作成
    //--------------------------------------
    function _createMetadata( uint256 tokenId ) internal view returns( bytes memory ){        
        bytes memory bytesId = LibStr.numToStr( tokenId );
        bytes memory bytesBirthday = LibStr.numToStr( _arrBirthday[tokenId-TOKEN_ID_OFS] );
        bytes memory bytesCreator = LibStr.numToStrHex( uint256(uint160(_arrCreator[tokenId-TOKEN_ID_OFS])), 40 );
        bytes memory bytesName = abi.encodePacked( '"name":"', TOKEN_SYMBOL, ' #', bytesId, '",' );
        bytes memory bytesDescription = abi.encodePacked( '"description":"', TOKEN_NAME, ' created by 0x', bytesCreator, '",' );
        bytes memory bytesAttributes = abi.encodePacked( '"attributes":[', '{"trait_type":"creator","value":"0x', bytesCreator, '"},', '{"display_type":"date","trait_type":"birthday","value":', bytesBirthday, '}],');
        return( abi.encodePacked( bytesName, bytesDescription, bytesAttributes ) );
    }

    //--------------------------------------
    // [internal] svgのパレット作成
    //--------------------------------------
    function _createSvgPal( uint256 tokenId ) internal view returns( bytes memory ){
        bytes[COL_IN_PAL] memory arrPal = _arrPal[tokenId-TOKEN_ID_OFS];
        bytes memory arrPalCount = _arrPalCount[tokenId-TOKEN_ID_OFS];
 
        bytes memory bytesUse;
        uint256 y = 20;
        for( uint256 i=0; i<COL_IN_PAL; i++ ){
            uint256 use = uint256(uint8(arrPalCount[i]));
            if( use <= 0 ){
                continue;
            }

            bytesUse = abi.encodePacked( bytesUse, '<rect x="5" y="', LibStr.numToStr(y) ,'" width="30" height="', LibStr.numToStr(use) ,'" fill="#', arrPal[i], '" />' );
            y += use;
        }

        return( abi.encodePacked( '<rect x="3" y="18" width="34" height="260" fill="#111" />', bytesUse ) );
    }

    //--------------------------------------
    // [internal] svgのドット作成
    //--------------------------------------
    function _createSvgDot( uint256 tokenId ) internal view returns( bytes memory ){
        bytes memory arrDot = _arrDot[tokenId-TOKEN_ID_OFS];
        bytes[COL_IN_PAL] memory arrPal = _arrPal[tokenId-TOKEN_ID_OFS];

        bytes[DOT_HEIGHT] memory bytesLines;
        for( uint256 y=0; y<DOT_HEIGHT; y++ ){
            for( uint256 x=0; x<DOT_WIDTH; x++ ){
                uint256 c = uint256(uint8(arrDot[DOT_WIDTH*y+x]));
                bytesLines[y] = abi.encodePacked( bytesLines[y], '<rect x="', _strArrX[x], '" y="', _strArrY[y], '" width="18" height="18" fill="#', arrPal[c], '" />' );
            }
        }

        bytesLines[0] = abi.encodePacked( bytesLines[0], bytesLines[1], bytesLines[2], bytesLines[3] );
        bytesLines[4] = abi.encodePacked( bytesLines[4], bytesLines[5], bytesLines[6], bytesLines[7] );
        bytesLines[8] = abi.encodePacked( bytesLines[8], bytesLines[9], bytesLines[10], bytesLines[11] );
        bytesLines[12] = abi.encodePacked( bytesLines[12], bytesLines[13], bytesLines[14], bytesLines[15] );
        return( abi.encodePacked( '<rect x="40" y="18" width="307" height="307" fill="#111" />', bytesLines[0], bytesLines[4], bytesLines[8], bytesLines[12] ) );
    }

    //--------------------------------------
    // [internal] svgのフッターの作成
    //--------------------------------------
    function _createSvgFooter( uint256 tokenId ) internal view returns( bytes memory ){
        bytes memory bytesId = LibStr.numToStr( tokenId );
        bytes memory bytesCreator = LibStr.numToStrHex( uint256(uint160(_arrCreator[tokenId-TOKEN_ID_OFS])), 40 );
        return( abi.encodePacked( '<text x="347" y="16" text-anchor="end" class="fn">', TOKEN_NAME, ' #', bytesId ,'</text><text x="2" y="346" textLength="55" lengthAdjust="spacingAndGlyphs" class="fn">created by</text><text x="60" y="347" textLength="288" lengthAdjust="spacingAndGlyphs" class="fc">0x', bytesCreator, '</text></svg>' ) );
    }
    
}
