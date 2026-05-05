package com.notebook.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FolderDto {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private List<FolderDto> children;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<FolderDto> getChildren() { return children; }
    public void setChildren(List<FolderDto> children) { this.children = children; }
}
