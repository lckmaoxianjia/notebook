package com.notebook.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.notebook.dto.NoteDetailDto;
import com.notebook.dto.NoteDto;
import com.notebook.entity.Note;
import com.notebook.mapper.NoteMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteService {
    private final NoteMapper noteMapper;

    public NoteService(NoteMapper noteMapper) {
        this.noteMapper = noteMapper;
    }

    public List<NoteDto> listByFolder(Long folderId) {
        List<Note> notes = noteMapper.selectList(
                new LambdaQueryWrapper<Note>()
                        .eq(Note::getFolderId, folderId)
                        .orderByDesc(Note::getUpdatedAt));
        return notes.stream().map(this::toDto).toList();
    }

    public NoteDetailDto getById(Long id) {
        Note note = noteMapper.selectById(id);
        if (note == null) return null;
        return toDetailDto(note);
    }

    @Transactional
    public NoteDetailDto create(Long folderId, String title) {
        Note note = new Note();
        note.setFolderId(folderId);
        note.setTitle(title != null ? title : "无标题");
        noteMapper.insert(note);
        return toDetailDto(note);
    }

    @Transactional
    public NoteDetailDto update(Long id, String title, String content, String contentJson) {
        Note note = new Note();
        note.setId(id);
        note.setTitle(title);
        note.setContent(content);
        note.setContentJson(contentJson);
        noteMapper.updateById(note);
        return toDetailDto(noteMapper.selectById(id));
    }

    @Transactional
    public void delete(Long id) {
        noteMapper.deleteById(id);
    }

    private NoteDto toDto(Note note) {
        NoteDto dto = new NoteDto();
        dto.setId(note.getId());
        dto.setFolderId(note.getFolderId());
        dto.setTitle(note.getTitle());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }

    private NoteDetailDto toDetailDto(Note note) {
        NoteDetailDto dto = new NoteDetailDto();
        dto.setId(note.getId());
        dto.setFolderId(note.getFolderId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setContentJson(note.getContentJson());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}
