#!/usr/bin/env python

import argparse
import getpass
import girder_client
import json
import six


def get_girder_client(opts):
    """
    Log in to Girder and return a reference to the client.

    :param opts: options that include the username, password, and girder api
        url.
    :returns: the girder client.
    """
    username = opts.get('username')
    password = opts.get('password')
    if not username:
        username = six.moves.input('Admin login: ')
    if not password:
        password = getpass.getpass('Password for %s: ' % (
            username if username else 'default admin user'))
    client = girder_client.GirderClient(apiUrl=opts['apiurl'])
    client.authenticate(username, password)
    return client


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Mark all items in a folder as large images.')
    parser.add_argument(
        'folder',
        help='The Girder resource path to the folder (e.g., /user/johndoe/Public/frames)')
    parser.add_argument(
        '--apiurl', '--api', '--url', '-a',
        default='http://127.0.0.1:8080/api/v1', help='The Girder api url.')
    parser.add_argument(
        '--password', '--pass', '--passwd', '--pw',
        help='The Girder admin password.  If not specified, a prompt is given.')
    parser.add_argument(
        '--username', '--user',
        help='The Girder admin username.  If not specified, a prompt is given.')
    parser.add_argument('--verbose', '-v', action='count', default=0)

    args = parser.parse_args()
    if args.verbose >= 2:
        print('Parsed arguments: %r' % args)
    client = get_girder_client(vars(args))
    folder = client.resourceLookup(args.folder)
    for item in client.listItem(folder['_id']):
        try:
            client.post('item/%s/tiles' % item['_id'])
        except girder_client.HttpError as exc:
            if exc.status == 400:
                try:
                    message = json.loads(exc.responseText)['message']
                    if message == 'Item already has a largeImage set.':
                        if args.verbose >= 1:
                            print('Already processed item %s' % item['name'])
                        continue
                    if message == 'Item is scheduled to generate a largeImage.':
                        if args.verbose >= 1:
                            print('Currently processing item %s' % item['name'])
                        continue
                except Exception:
                    pass
            raise exc
        print('Processing item %s' % item['name'])
