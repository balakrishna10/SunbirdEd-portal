
import {of as observableOf,  Observable } from 'rxjs';
import { TestBed, inject } from '@angular/core/testing';
import { CopyContentService } from './copy-content.service';
import { SharedModule } from '@sunbird/shared';
import { CoreModule, UserService, ContentService } from '@sunbird/core';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as testData from './copy-content.service.spec.data';

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('CopyContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule.forRoot(), CoreModule],
      providers: [CopyContentService, UserService, ContentService, { provide: Router, useClass: RouterStub }]
    });
  });

  it('should make copy api call and get success response', inject([CopyContentService, ContentService],
    (service: CopyContentService, contentService: ContentService) => {
      const userService = TestBed.get(UserService);
      userService._userProfile = testData.mockRes.userData;
      spyOn(contentService, 'post').and.callFake(() => observableOf(testData.mockRes.successResponse));
      service.copyContent(testData.mockRes.contentData).subscribe(
        apiResponse => {
          expect(apiResponse.responseCode).toBe('OK');
        }
      );
    }));

  it('should copy textbook as a curriculum course', inject([], () => {
    const service = TestBed.get(CopyContentService);
    const userService = TestBed.get(UserService);
    const contentService = TestBed.get(ContentService);
    const contentData = testData.mockRes.copyCourseContentData;
    userService._userProfile = testData.mockRes.userData;
    const userData = userService._userProfile;
    const params = {
      request: {
        source: contentData.identifier,
        course: {
          name: 'Copy of ' + contentData.name,
          description: contentData.description,
          organisation: userData.organisationNames,
          createdFor: userData.organisationIds,
          createdBy: userData.userId,
          framework: contentData.framework
        }
      }
    };
    const option = {
      url: 'course/v1/create',
      data: params
    };
    spyOn(contentService, 'post').and.callFake(() => observableOf(testData.mockRes.copyContentSuccess));
    service.copyAsCourse(contentData);
    expect(contentService.post).toHaveBeenCalledWith(option);
  }));

  it('should open collection editor when a textbook is copied as curriculum course', inject([], () => {
    const service = TestBed.get(CopyContentService);
    const router = TestBed.get(Router);
    const url = `/workspace/content/edit/collection/do_11302157861002444811/Course/draft/NCFCOPY/Draft`;
    service.openCollectionEditor('NCFCOPY', 'do_11302157861002444811');
    expect(router.navigate).toHaveBeenCalledWith([url]);
  }));
});