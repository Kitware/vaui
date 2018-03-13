from setuptools import setup, find_packages
from pip.req import parse_requirements

install_reqs = parse_requirements('requirements.txt', session=False)
reqs = [str(ir.req) for ir in install_reqs]

setup(name='VAUI',
      version='0.0.0.dev1',
      description='',
      url='https://github.com/kitware/vaui',
      install_requires=reqs,
      author='Kitware Inc',
      author_email='',
      license='',
      classifiers=[
          'Development Status :: 2 - Pre-Alpha',
          'License :: OSI Approved :: Apache Software License'
          'Topic :: Scientific/Engineering :: GIS',
          'Intended Audience :: Science/Research',
          'Natural Language :: English',
          'Programming Language :: Python'
      ],
      packages=find_packages(exclude=['tests*', 'server*', 'docs']),
      entry_points={
          'girder_worker_plugins': [
              'interpolation_tasks = tasks:InterpolationTasks',
          ]
      },
      zip_safe=False)
