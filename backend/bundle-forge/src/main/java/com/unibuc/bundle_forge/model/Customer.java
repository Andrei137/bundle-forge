package com.unibuc.bundle_forge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder(toBuilder = true)
@Entity
@Table(name = "customer")
public class Customer extends User {

    @Column(nullable = false)
    @JsonView(ViewUtils.Public.class)
    private String lastName;

    @Column(nullable = false)
    @JsonView(ViewUtils.Public.class)
    private String firstName;

    @Column(unique = true)
    @JsonView(ViewUtils.Public.class)
    private String phoneNumber;

    @ManyToMany
    @JoinTable(
            name = "library",
            joinColumns = @JoinColumn(name = "customer_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    @JsonIgnore
    private List<Game> ownedGames;

}
