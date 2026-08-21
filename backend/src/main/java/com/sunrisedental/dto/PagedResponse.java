package com.sunrisedental.dto;

import java.util.List;

/**
 * PagedResponse — generic pagination wrapper returned by list endpoints.
 *
 * <p>Mirrors the structure of {@link org.springframework.data.domain.Page}
 * but exposes only the fields the frontend actually needs, keeping the API
 * contract stable if the underlying pagination library changes.
 *
 * @param <T> type of the content items
 */
public class PagedResponse<T> {

    private List<T> content;
    private int     page;         // 0-indexed, matches Spring Data convention
    private int     size;
    private long    totalElements;
    private int     totalPages;
    private boolean first;
    private boolean last;

    public PagedResponse() {}

    public PagedResponse(List<T> content, int page, int size,
                         long totalElements, int totalPages) {
        this.content       = content;
        this.page          = page;
        this.size          = size;
        this.totalElements = totalElements;
        this.totalPages    = totalPages;
        this.first         = page == 0;
        this.last          = page >= totalPages - 1;
    }

    // -------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------

    public List<T> getContent()          { return content; }
    public void    setContent(List<T> v) { content = v; }

    public int  getPage()                { return page; }
    public void setPage(int v)           { page = v; }

    public int  getSize()                { return size; }
    public void setSize(int v)           { size = v; }

    public long getTotalElements()       { return totalElements; }
    public void setTotalElements(long v) { totalElements = v; }

    public int  getTotalPages()          { return totalPages; }
    public void setTotalPages(int v)     { totalPages = v; }

    public boolean isFirst()             { return first; }
    public void    setFirst(boolean v)   { first = v; }

    public boolean isLast()              { return last; }
    public void    setLast(boolean v)    { last = v; }
}
