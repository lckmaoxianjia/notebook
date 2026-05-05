package com.notebook.controller;

import com.notebook.dto.NoteDetailDto;
import com.notebook.service.ShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/share")
public class ShareController {
    private final ShareService shareService;

    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<NoteDetailDto> getSharedNote(@PathVariable String token) {
        NoteDetailDto note = shareService.getByToken(token);
        return note != null ? ResponseEntity.ok(note) : ResponseEntity.notFound().build();
    }
}
