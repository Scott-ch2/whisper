package com.speechtrans.dto;

import lombok.Data;

@Data
public class TranslateRequest {
    private String srcLang;
    private String tgtLang;
}
