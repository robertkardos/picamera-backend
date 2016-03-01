from socketIO_client import SocketIO

def on_aaa_response(*args):
    print('on_aaa_response', args)

with SocketIO('localhost', 6000) as SocketIO:
    socketIO.on('aaa_response', on_aaa_response)
    socketIO.emit('aaa')
