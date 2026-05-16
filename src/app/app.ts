import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubService } from './services/github.service';
import { Repo } from './models/repo.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private githubService = inject(GithubService);
  
  protected repos = signal<Repo[]>([]);
  protected loading = signal<boolean>(true);
  protected currentDate = new Date();
  
  protected activeTab = signal<'resumo' | 'formacao' | 'experiencia'>('resumo');
  protected totalProjects = signal<number>(0);
  protected isMenuOpen = signal<boolean>(false);

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  ngOnInit() {
    // Fetch repositories
    this.githubService.getRepos().subscribe({
      next: (data) => {
        this.repos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch repositories', err);
        this.loading.set(false);
      }
    });

    // Fetch user profile for total public repos
    this.githubService.getProfile().subscribe({
      next: (profile) => {
        if (profile && profile.public_repos) {
          this.totalProjects.set(profile.public_repos);
        }
      }
    });
  }

  setTab(tab: 'resumo' | 'formacao' | 'experiencia') {
    this.activeTab.set(tab);
  }
}
