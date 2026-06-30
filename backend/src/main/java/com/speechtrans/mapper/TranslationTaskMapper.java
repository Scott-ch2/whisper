package com.speechtrans.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.speechtrans.entity.TranslationTask;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TranslationTaskMapper extends BaseMapper<TranslationTask> {
}
