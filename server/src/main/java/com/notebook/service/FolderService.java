package com.notebook.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.notebook.dto.FolderDto;
import com.notebook.entity.Folder;
import com.notebook.mapper.FolderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FolderService {
    private final FolderMapper folderMapper;

    public FolderService(FolderMapper folderMapper) {
        this.folderMapper = folderMapper;
    }

    public List<FolderDto> listTree() {
        List<Folder> folders = folderMapper.selectList(
                new LambdaQueryWrapper<Folder>().orderByAsc(Folder::getSortOrder));
        Map<Long, List<Folder>> childrenMap = folders.stream()
                .filter(f -> f.getParentId() != null)
                .collect(Collectors.groupingBy(Folder::getParentId));

        return folders.stream()
                .filter(f -> f.getParentId() == null)
                .map(f -> toDto(f, childrenMap))
                .collect(Collectors.toList());
    }

    private FolderDto toDto(Folder folder, Map<Long, List<Folder>> childrenMap) {
        FolderDto dto = new FolderDto();
        dto.setId(folder.getId());
        dto.setParentId(folder.getParentId());
        dto.setName(folder.getName());
        dto.setSortOrder(folder.getSortOrder());
        dto.setCreatedAt(folder.getCreatedAt());
        List<Folder> children = childrenMap.getOrDefault(folder.getId(), List.of());
        dto.setChildren(children.stream().map(c -> toDto(c, childrenMap)).collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public FolderDto create(String name, Long parentId) {
        Folder folder = new Folder();
        folder.setName(name);
        folder.setParentId(parentId);
        folderMapper.insert(folder);
        return toDto(folder, Map.of());
    }

    @Transactional
    public void update(Long id, String name, Long parentId) {
        Folder folder = new Folder();
        folder.setId(id);
        folder.setName(name);
        folder.setParentId(parentId);
        folderMapper.updateById(folder);
    }

    @Transactional
    public void delete(Long id) {
        folderMapper.deleteById(id);
    }
}
