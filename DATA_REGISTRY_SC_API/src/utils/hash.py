import hashlib
import json
from typing import Union

def prepare_data(data: Union[str, dict]) -> str:
    """
    Prepares the data for hashing by converting it to a string.
    
    :param data: The data to be hashed, either a string or a JSON object.
    :return: The data as a string.
    :raises ValueError: If the data is neither a string nor a JSON object.
    """
    if isinstance(data, str):
        return data
    elif isinstance(data, dict):
        return json.dumps(data, sort_keys=True)
    else:
        raise ValueError("Data must be either a string or a JSON object")

def hash_data(data: Union[str, dict]) -> bytes:
    """
    Hashes the given data using the SHA256 algorithm.

    :param data: The data to be hashed, either a string or a JSON object.
    :return: The hashed data as bytes.
    :raises ValueError: If there is an error while hashing the data.
    """
    try:
        data_str = prepare_data(data)
        return hashlib.sha256(data_str.encode('utf-8')).digest()
    except Exception as error:
        raise ValueError(f"Failed to hash data: {error}")

def hash_hex(data: Union[str, dict]) -> str:
    """
    Hashes the given data using the SHA256 algorithm and returns the hash in hexadecimal format.

    :param data: The data to be hashed, either a string or a JSON object.
    :return: The hashed data as a hexadecimal string.
    :raises ValueError: If there is an error while hashing the data.
    """
    try:
        data_str = prepare_data(data)
        return hashlib.sha256(data_str.encode('utf-8')).hexdigest()
    except Exception as error:
        raise ValueError(f"Failed to hash data: {error}")


def main():
    print(hash_hex("hello world"))
    print(hash_hex({
        "name": "John",
        "age": 19
    }))

if __name__ == "__main__":
    main()
