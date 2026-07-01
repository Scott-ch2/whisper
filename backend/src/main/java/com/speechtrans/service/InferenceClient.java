package com.speechtrans.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;
    private final String inferenceUrl;

    public InferenceClient(@Value("${inference.url:http://localhost:8000}") String inferenceUrl) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.inferenceUrl = inferenceUrl;
    }

    /**
     * Call Python inference service: audio → transcription + translation + segments
     *
     * POST {inferenceUrl}/inference/translate
     * Content-Type: multipart/form-data
     *
     * @return { transcription, translation, detectedLanguage, segments, duration }
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> translate(byte[] audioBytes, String fileName, String srcLang, String tgtLang) {
        try {
            // Build multipart request
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

            var httpEntity = new HttpEntity<>(requestEntity, null); // let RestTemplate set multipart headers

            String url = inferenceUrl + "/inference/translate";

            // Use custom multipart request
            var response = restTemplate.postForEntity(url, httpEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> bodyMap = response.getBody();
                Object data = bodyMap.get("data");
                if (data instanceof Map) {
                    return (Map<String, Object>) data;
                }
            }
        } catch (Exception e) {
            System.err.println("Inference service call failed: " + e.getMessage());
            e.printStackTrace();
        }

        // Fallback: return mock result if Python service unreachable
        return getMockResult();
    }

    /**
     * Mock result for when Python service is not available
     */
    private Map<String, Object> getMockResult() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transcription", "Hello everyone, welcome to the AI real-time translation demo.");
        result.put("translation", "大家好，欢迎体验 AI 实时翻译演示。");
        result.put("detectedLanguage", "en");

        List<Map<String, Object>> segments = new ArrayList<>();

        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("start", 0.0);
        s1.put("end", 3.2);
        s1.put("sourceText", "Hello everyone,");
        s1.put("targetText", "大家好，");
        segments.add(s1);

        Map<String, Object> s2 = new LinkedHashMap<>();
        s2.put("start", 3.2);
        s2.put("end", 6.5);
        s2.put("sourceText", "welcome to the AI real-time translation demo.");
        s2.put("targetText", "欢迎体验 AI 实时翻译演示。");
        segments.add(s2);

        result.put("segments", segments);
        result.put("duration", 6.5);
        return result;
    }
}
