package com.speechtrans.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * InferenceClient — HTTP client to Python FastAPI inference service
 */
@Service
public class InferenceClient {

    private final RestTemplate restTemplate;
    private final String inferenceUrl;

    public InferenceClient(@Value("${inference.url:http://localhost:8000}") String inferenceUrl) {
        this.restTemplate = new RestTemplate();
        this.inferenceUrl = inferenceUrl;
    }

    /**
     * Call Python inference service: audio → transcription + translation + segments
     *
     * POST {inferenceUrl}/inference/translate
     * Content-Type: multipart/form-data
     *
     * @return { transcription, translation, detectedLanguage, segments, duration }
     * @throws RuntimeException if inference service is unreachable
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> translate(byte[] audioBytes, String fileName, String srcLang, String tgtLang) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        var body = new org.springframework.core.io.ByteArrayResource(audioBytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };

        var requestEntity = new org.springframework.util.LinkedMultiValueMap<String, Object>();
        requestEntity.add("file", body);
        requestEntity.add("src_lang", srcLang != null ? srcLang : "auto");
        requestEntity.add("tgt_lang", tgtLang != null ? tgtLang : "zh");

        var httpEntity = new HttpEntity<>(requestEntity, null);

        String url = inferenceUrl + "/inference/translate";
        var response = restTemplate.postForEntity(url, httpEntity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> bodyMap = response.getBody();
            Object data = bodyMap.get("data");
            if (data instanceof Map) {
                return (Map<String, Object>) data;
            }
        }

        throw new RuntimeException("Inference service error: " + response.getStatusCode());
    }
}
