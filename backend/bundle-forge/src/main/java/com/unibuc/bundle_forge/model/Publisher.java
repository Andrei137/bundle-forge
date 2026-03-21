package com.unibuc.bundle_forge.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@Entity
@Table(name = "publisher")
public class Publisher extends Provider {

    @OneToMany(mappedBy = "publisher")
    @JsonIgnore
    private List<Game> publishedGames;

    @OneToMany(mappedBy = "publisher")
    @JsonIgnore
    private List<Contract> contracts;

}
