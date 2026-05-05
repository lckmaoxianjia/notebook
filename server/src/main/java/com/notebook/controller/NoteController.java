package com.notebook.controller;

import com.notebook.dto.NoteDetailDto;
import com.notebook.dto.NoteDto;
import com.notebook.dto.ShareResult;
import com.notebook.service.NoteService;
import com.notebook.service.ShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService noteService;
    private final ShareService shareService;

    public NoteController(NoteService noteService, ShareService shareService) {
        this.noteService = noteService;
        this.shareService = shareService;
    }

    @GetMapping
    public ResponseEntity<List<NoteDto>> list(@RequestParam Long folderId) {
        return ResponseEntity.ok(noteService.listByFolder(folderId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteDetailDto> get(@PathVariable Long id) {
        NoteDetailDto note = noteService.getById(id);
        return note != null ? ResponseEntity.ok(note) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<NoteDetailDto> create(@RequestBody Map<String, Object> body) {
        Long folderId = ((Number) body.get("folderId")).longValue();
        String title = (String) body.get("title");
        return ResponseEntity.ok(noteService.create(folderId, title));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteDetailDto> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        String contentJson = (String) body.get("contentJson");
        return ResponseEntity.ok(noteService.update(id, title, content, contentJson));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        noteService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<ShareResult> share(@PathVariable Long id) {
        String token = shareService.createShareLink(id);
        if (token == null) return ResponseEntity.notFound().build();
        ShareResult result = new ShareResult();
        result.setToken(token);
        result.setUrl("/share/" + token);
        return ResponseEntity.ok(result);
    }
}
