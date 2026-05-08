package com.unibuc.bundle_forge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tag")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    @JsonView(ViewUtils.Public.class)
    private String name;

    @JsonIgnore
    @ManyToMany(mappedBy = "tags")
    @JsonView(ViewUtils.Public.class)
    private Set<Game> games = new HashSet<>();

}
