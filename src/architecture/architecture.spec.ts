import { RelativePath } from 'arch-unit-ts/dist/arch-unit/core/domain/RelativePath.js';
import { TypeScriptProject } from 'arch-unit-ts/dist/arch-unit/core/domain/TypeScriptProject.js';
import { noClasses } from 'arch-unit-ts/dist/main.js';

describe('Architecture rules', () => {
  const project = new TypeScriptProject(RelativePath.of('src'));

  it('domain must not depend on infrastructure', () => {
    noClasses()
      .that()
      .resideInAnyPackage('..domain..')
      .should()
      .dependOnClassesThat()
      .resideInAnyPackage('..infrastructure..')
      .because('Domain must not depend on infrastructure')
      .check(project.allClasses());
  });

  it('application must not depend on infrastructure', () => {
    noClasses()
      .that()
      .resideInAnyPackage('..application..')
      .should()
      .dependOnClassesThat()
      .resideInAnyPackage('..infrastructure..')
      .because('Application must depend on ports, not infrastructure')
      .check(project.allClasses());
  });

  it('stock domain and application must not depend on catalog', () => {
    noClasses()
      .that()
      .resideInAnyPackage('..stock.domain..', '..stock.application..')
      .should()
      .dependOnClassesThat()
      .resideInAnyPackage('..catalog..')
      .because('Stock reaches Catalog only through its infrastructure adapter')
      .check(project.allClasses());
  });

  it('catalog must not depend on stock', () => {
    noClasses()
      .that()
      .resideInAnyPackage('..src.catalog..')
      .should()
      .dependOnClassesThat()
      .resideInAnyPackage('..src.stock..')
      .because('Catalog must not depend on Stock')
      .check(project.allClasses());
  });
});
