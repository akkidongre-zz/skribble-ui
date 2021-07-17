import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGridListComponent } from './image-grid-list.component';

describe('ImageGridListComponent', () => {
  let component: ImageGridListComponent;
  let fixture: ComponentFixture<ImageGridListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageGridListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGridListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
