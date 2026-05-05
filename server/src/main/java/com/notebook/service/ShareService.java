package com.notebook.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.notebook.dto.NoteDetailDto;
import com.notebook.entity.Note;
import com.notebook.entity.ShareLink;
import com.notebook.mapper.NoteMapper;
import com.notebook.mapper.ShareLinkMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ShareService {
    private final ShareLinkMapper shareLinkMapper;
    private final NoteMapper noteMapper;

    public ShareService(ShareLinkMapper shareLinkMapper, NoteMapper noteMapper) {
        this.shareLinkMapper = shareLinkMapper;
        this.noteMapper = noteMapper;
    }

    @Transactional
    public String createShareLink(Long noteId) {
        Note note = noteMapper.selectById(noteId);
        if (note == null) return null;

        ShareLink existing = shareLinkMapper.selectOne(
                new LambdaQueryWrapper<ShareLink>().eq(ShareLink::getNoteId, noteId));
        if (existing != null) return existing.getToken();

        ShareLink link = new ShareLink();
        link.setNoteId(noteId);
        link.setToken(UUID.randomUUID().toString().replace("-", ""));
        shareLinkMapper.insert(link);
        return link.getToken();
    }

    public NoteDetailDto getByToken(String token) {
        ShareLink link = shareLinkMapper.selectOne(
                new LambdaQueryWrapper<ShareLink>().eq(ShareLink::getToken, token));
        if (link == null) return null;

        Note note = noteMapper.selectById(link.getNoteId());
        if (note == null) return null;

        NoteDetailDto dto = new NoteDetailDto();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}
