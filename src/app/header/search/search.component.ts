import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchKey = '';

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
  }

  searchForNotes() {
    this.commonService.searchQuery.next(this.searchKey);
  }

  clearSearchKey() {
    this.searchKey = '';
    this.searchForNotes();
  }

}
