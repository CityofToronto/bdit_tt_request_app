import csv
import os

import xlsxwriter

TEMP_FILE_NAME = 'temp'

__all__ = ['make_temp_file_path', 'make_travel_data_xlsx', 'make_travel_data_csv']


def make_temp_file_path(filename):
    """
    Make a file path string for the temporary file.
    The location of the temporary file is defined in the system environment field TEMP_FILE_LOCATION
    If it starts with '/', it represents an absolute path to the folder storing temporary files.
    Otherwise, the system environment path is the relative path to the current working directory.

    :param filename: the filename of the temporary file
    :return: a full path to the temporary file
    """
    temp_file_folder_name = os.environ['TEMP_FILE_LOCATION']

    if temp_file_folder_name.startswith('/'):
        temp_file_path = "%s/%s" % (temp_file_folder_name, filename)
    else:
        temp_file_path = "%s/%s/%s" % (os.getcwd(), temp_file_folder_name, filename)

    return temp_file_path


def make_travel_data_xlsx(travel_data_list):
    """
    Make an xlsx file containing all the travel data in order.
    The xlsx file's first row is the header containing column names 'link_dir', 'tx', 'length', 'mean', 'stddev',
    'confidence', 'pct_50'.

    :param travel_data_list: the list of travel data
    :return: the file path of the xlsx file
    """
    filename = "%s.xlsx" % TEMP_FILE_NAME
    file_path = make_temp_file_path(filename)
    travel_data_workbook = xlsxwriter.Workbook(file_path)
    travel_data_worksheet = travel_data_workbook.add_worksheet()

    travel_data_fields = ['link_dir', 'tx', 'length', 'mean', 'stddev', 'confidence', 'pct_50']
    for i in range(len(travel_data_fields)):
        travel_data_worksheet.write(0, i, travel_data_fields[i])

    row = 1
    col = 0
    for travel_data in travel_data_list:
        for i in range(len(travel_data_fields)):
            travel_data_worksheet.write(row, col + i, travel_data[travel_data_fields[i]])

        row += 1

    travel_data_workbook.close()
    return file_path


def make_travel_data_csv(travel_data_list):
    """
    Make a csv file containing all the travel data in order.
    The csv has headers 'link_dir', 'tx', 'length', 'mean', 'stddev', 'confidence', 'pct_50'.

    :param travel_data_list: the list of travel data
    :return: the file path of the csv file
    """
    filename = "%s.csv" % TEMP_FILE_NAME
    file_path = make_temp_file_path(filename)

    with open(file_path, 'w', newline='') as csvfile:
        travel_data_fields = ['link_dir', 'tx', 'length', 'mean', 'stddev', 'confidence', 'pct_50']
        csv_writer = csv.DictWriter(csvfile, fieldnames=travel_data_fields)

        csv_writer.writeheader()
        for travel_data in travel_data_list:
            csv_writer.writerow(travel_data)

        csvfile.flush()

    return file_path
