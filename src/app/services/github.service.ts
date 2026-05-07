import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin, catchError, of } from 'rxjs';
import { Repo } from '../models/repo.interface';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.github.com/users/DevGHZ/repos?sort=updated&per_page=10';

  getRepos(): Observable<Repo[]> {
    return this.http.get<Repo[]>(this.apiUrl).pipe(
      map(repos => repos.filter(repo => !repo.fork)),
      switchMap(repos => {
        if (repos.length === 0) return of([]);
        
        const repoRequests = repos.map(repo => {
          const branch = repo.default_branch || 'main';
          const readmeUrl = `https://raw.githubusercontent.com/DevGHZ/${repo.name}/${branch}/README.md`;
          
          return this.http.get(readmeUrl, { responseType: 'text' }).pipe(
            map(readme => {
              const imgRegex = /(?:!\[.*?\]\((.*?)\))|(?:<img.*?src=['"](.*?)['"].*?>)/i;
              const match = readme.match(imgRegex);
              
              let imageUrl = `https://opengraph.githubassets.com/1/DevGHZ/${repo.name}`;
              
              if (match) {
                const extractedUrl = match[1] || match[2];
                // Ignore small badges or shields
                if (extractedUrl && !extractedUrl.includes('img.shields.io') && !extractedUrl.includes('badge')) {
                   if(extractedUrl.startsWith('http')) {
                      imageUrl = extractedUrl;
                   } else {
                      // Convert relative path to absolute raw github path
                      imageUrl = `https://raw.githubusercontent.com/DevGHZ/${repo.name}/${branch}/${extractedUrl.replace(/^\.\//, '')}`;
                   }
                }
              }
              
              return { ...repo, imageUrl };
            }),
            catchError(() => {
              return of({ ...repo, imageUrl: `https://opengraph.githubassets.com/1/DevGHZ/${repo.name}` });
            })
          );
        });
        
          return forkJoin(repoRequests);
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get('https://api.github.com/users/DevGHZ');
  }
}
