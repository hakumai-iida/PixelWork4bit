// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

//--------------------------
// 文字列ライブラリ
//--------------------------
library LibStr {
    //---------------------------
    // 数値を１０進数文字列にして返す
    //---------------------------
    function numToStr( uint256 val ) internal pure returns (bytes memory) {
        // 数字の桁
        uint256 len = 1;
        uint256 temp = val;
        while( temp >= 10 ){
            temp = temp / 10;
            len++;
        }

        // バッファ確保
        bytes memory buf = new bytes(len);

        // 数字の出力
        temp = val;
        for( uint256 i=0; i<len; i++ ){
            uint c = 48 + (temp%10);
            buf[len-(i+1)] = bytes1(uint8(c));
            temp /= 10;
        }

        return( buf );
    }

    //----------------------------
    // 数値を１６進数文字列にして返す
    //----------------------------
    function numToStrHex( uint256 val, uint256 zeroFill ) internal pure returns (bytes memory) {
        // 数字の桁
        uint256 len = 1;
        uint256 temp = val;
        while( temp >= 16 ){
            temp = temp / 16;
            len++;
        }

        // ゼロ埋め桁数
        uint256 padding = 0;
        if( zeroFill > len ){
            padding = zeroFill - len;
        }

        // バッファ確保
        bytes memory buf = new bytes(padding + len);

        // ０埋め
        for( uint256 i=0; i<padding; i++ ){
            buf[i] = bytes1(uint8(48));
        }

        // 数字の出力
        temp = val;
        for( uint256 i=0; i<len; i++ ){
            uint c = temp % 16;    
            if( c < 10 ){
                c += 48;
            }else{
                c += 87;
            }
            buf[padding+len-(i+1)] = bytes1(uint8(c));
            temp /= 16;
        }

        return( buf );
    }
}
